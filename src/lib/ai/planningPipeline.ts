import { GoogleGenAI } from '@google/genai';
import { ParsedNLRequest, ParsedNLRequestSchema, FullEventPlan, FullEventPlanSchema } from '@/types/event';
import { generateDeterministicPlan } from '@/lib/data/sampleScenarios';
import { validateTaskDependencies } from '@/lib/planning/dependencyEngine';
import { validateCategoryAllocations } from '@/lib/planning/budgetEngine';

/**
 * Initializes Gemini client safely on the server side.
 * Never leaks the key or throws unhandled exceptions if the key is missing.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize GoogleGenAI client:', error);
    return null;
  }
}

/**
 * 1. Natural Language Parser Pipeline:
 * Converts freeform event descriptions into a strongly typed, validated ParsedNLRequest.
 */
export async function parseNaturalLanguagePrompt(prompt: string): Promise<{
  data: ParsedNLRequest;
  isAiGenerated: boolean;
  notes?: string;
}> {
  // Input sanitization & prompt injection prevention:
  // Disallow excessively large inputs and neutralize common delimiter attacks
  const sanitizedPrompt = prompt.slice(0, 2000).replace(/<\/?[^>]+(>|$)/g, '');

  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!ai) {
    // Deterministic fallback regex parser
    return {
      data: fallbackParseText(sanitizedPrompt),
      isAiGenerated: false,
      notes: 'Parsed using deterministic rule-based engine (Gemini API key not configured or demo mode).',
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are EventWise AI, an expert event planner. Extract structured event specifications from the following user prompt into valid JSON matching this schema:
{
  "name": string (descriptive name),
  "eventType": "wedding" | "birthday" | "community",
  "guestCount": integer > 0,
  "budgetTotal": number > 0,
  "currency": "INR" | "USD" | "EUR",
  "daysUntilEvent": integer > 0 (default 45 if unspecified),
  "location": string,
  "themeStyle": string,
  "culturalDietaryPreferences": string,
  "priorities": string[],
  "specialConstraints": string
}

User prompt:
"""${sanitizedPrompt}"""

Respond ONLY with valid JSON. No markdown code blocks, no preamble.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const parsedJson = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
    const validated = ParsedNLRequestSchema.parse(parsedJson);

    return {
      data: validated,
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn('Gemini NL parse failed or returned schema mismatch, applying deterministic fallback:', err);
    return {
      data: fallbackParseText(sanitizedPrompt),
      isAiGenerated: false,
      notes: 'AI parsing failed or timed out. Deterministic fallback engaged safely.',
    };
  }
}

/**
 * Deterministic text extractor for demo / offline operation
 */
function fallbackParseText(text: string): ParsedNLRequest {
  const lower = text.toLowerCase();
  
  // Event Type
  let eventType: 'wedding' | 'birthday' | 'community' = 'wedding';
  if (lower.includes('birthday') || lower.includes('party')) {
    eventType = 'birthday';
  } else if (lower.includes('community') || lower.includes('festival') || lower.includes('fair') || lower.includes('street')) {
    eventType = 'community';
  }

  // Guest Count regex
  let guestCount = 200;
  const guestMatch = text.match(/(\d+)\s*(guests?|people|attendees|pax)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1], 10);
  }

  // Budget regex
  let budgetTotal = eventType === 'wedding' ? 500000 : eventType === 'birthday' ? 40000 : 250000;
  const budgetMatch = text.match(/(₹|rs\.?|inr|\$)?\s*(\d+[\d,]*(\.\d+)?)\s*(lakh|lakhs|k)?/i);
  if (budgetMatch) {
    let num = parseFloat(budgetMatch[2].replace(/,/g, ''));
    const unit = budgetMatch[4]?.toLowerCase();
    if (unit === 'lakh' || unit === 'lakhs') {
      num = num * 100000;
    } else if (unit === 'k') {
      num = num * 1000;
    }
    if (num > 0) budgetTotal = num;
  }

  // Days until event
  let daysUntilEvent = 45;
  const daysMatch = text.match(/(\d+)\s*(days?|weeks?|months?)/i);
  if (daysMatch) {
    const val = parseInt(daysMatch[1], 10);
    const unit = daysMatch[2].toLowerCase();
    if (unit.startsWith('week')) daysUntilEvent = val * 7;
    else if (unit.startsWith('month')) daysUntilEvent = val * 30;
    else daysUntilEvent = val;
  }

  // Location detection
  let location = 'Chennai, India';
  if (lower.includes('chennai')) location = 'Chennai, Tamil Nadu';
  else if (lower.includes('bangalore') || lower.includes('bengaluru')) location = 'Bangalore, Karnataka';
  else if (lower.includes('mumbai')) location = 'Mumbai, Maharashtra';
  else if (lower.includes('pune')) location = 'Pune, Maharashtra';
  else if (lower.includes('delhi')) location = 'New Delhi';

  // Dietary
  let culturalDietaryPreferences = 'Vegetarian friendly options';
  if (lower.includes('tamil') || lower.includes('south indian') || lower.includes('elai sapadu')) {
    culturalDietaryPreferences = 'Authentic Traditional South Indian Elai Sapadu (Pure Veg)';
  } else if (lower.includes('jain')) {
    culturalDietaryPreferences = 'Strict Jain Menu (No root vegetables)';
  }

  return {
    name: `${location.split(',')[0]} ${eventType === 'wedding' ? 'Grand Wedding' : eventType === 'birthday' ? 'Birthday Celebration' : 'Community Festival'}`,
    eventType,
    guestCount,
    budgetTotal,
    currency: 'INR',
    daysUntilEvent,
    location,
    themeStyle: eventType === 'wedding' ? 'Traditional Temple & Floral Elegance' : 'Modern Vibrant Celebratory',
    culturalDietaryPreferences,
    priorities: ['Good Food & Catering', 'Comfortable Guest Experience', 'On-Time Execution'],
    specialConstraints: 'Ensure strict budget compliance and accessible entry',
  };
}

/**
 * 2. Full Plan Generation Pipeline:
 * Generates plan structure, runs deterministic validations, verifies constraints and returns aggregate.
 */
export async function generateFullEventPlan(req: ParsedNLRequest): Promise<FullEventPlan> {
  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!ai) {
    return generateDeterministicPlan(req);
  }

  try {
    const prompt = `You are EventWise AI's Master Planning Engine.
Generate an exhaustive, realistic event plan for:
Event: ${req.name} (${req.eventType})
Guest Count: ${req.guestCount}
Total Budget: ${req.budgetTotal} ${req.currency}
Location: ${req.location}
Days until event: ${req.daysUntilEvent}
Dietary / Cultural: ${req.culturalDietaryPreferences || 'None'}
Theme: ${req.themeStyle || 'Curated'}

Requirements:
1. Provide 5-6 realistic budget categories where total sum of allocatedAmount EXACTLY equals ${req.budgetTotal}. Must include one category named 'Contingency Reserve' with isContingency=true (around 10% of total).
2. Provide 5-8 sequenced tasks with dueDates relative to today (${new Date().toISOString().split('T')[0]}), sensible priorities, and non-circular dependencies using UUIDs.
3. Provide 3-4 sample realistic vendors with quoted prices, location, and phone/email. Mark isDemo: true.

Return valid JSON adhering to:
{
  "categories": [{ "name": string, "allocatedAmount": number, "isContingency": boolean, "notes": string }],
  "tasks": [{ "name": string, "description": string, "priority": "low"|"medium"|"high"|"critical", "daysFromNow": number, "estimatedCost": number }],
  "vendors": [{ "name": string, "category": string, "quotedPrice": number, "servicesOffered": string, "location": string }]
}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    
    // Construct and deterministically sanitize plan
    const eventId = crypto.randomUUID();
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + req.daysUntilEvent);

    const categories = (parsedJson.categories || []).map((c: any) => ({
      id: crypto.randomUUID(),
      eventId,
      name: c.name || 'Miscellaneous',
      allocatedAmount: Math.max(0, Number(c.allocatedAmount) || 0),
      spentAmount: 0,
      isContingency: Boolean(c.isContingency),
      notes: c.notes || '',
    }));

    // If categories don't add up or missing, fallback to deterministic categories
    const catCheck = validateCategoryAllocations(req.budgetTotal, categories);
    if (!catCheck.isValid || categories.length === 0) {
      console.warn('AI categories invalid, falling back to deterministic allocation:', catCheck.error);
      return generateDeterministicPlan(req);
    }

    const taskIds: string[] = [];
    const tasks = (parsedJson.tasks || []).map((t: any, idx: number) => {
      const id = crypto.randomUUID();
      taskIds.push(id);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (t.daysFromNow || (idx + 1) * 5));
      return {
        id,
        eventId,
        name: t.name || `Task ${idx + 1}`,
        description: t.description || '',
        status: 'todo' as const,
        priority: t.priority || 'medium',
        dueDate: dueDate.toISOString().split('T')[0],
        estimatedCost: Math.max(0, Number(t.estimatedCost) || 0),
        actualCost: 0,
        dependencies: idx > 0 ? [taskIds[idx - 1]] : [], // strictly linear DAG to guarantee no cycles
      };
    });

    // Validate graph invariants
    const graphCheck = validateTaskDependencies(tasks);
    if (!graphCheck.isValid) {
      console.warn('AI generated invalid task graph, falling back to deterministic tasks');
      return generateDeterministicPlan(req);
    }

    const vendors = (parsedJson.vendors || []).map((v: any) => ({
      id: crypto.randomUUID(),
      eventId,
      name: v.name || 'Sample Vendor',
      category: v.category || 'General',
      quotedPrice: Math.max(0, Number(v.quotedPrice) || 0),
      servicesOffered: v.servicesOffered || 'Full package',
      location: v.location || req.location,
      quoteStatus: 'received' as const,
      bookingStatus: 'tentative' as const,
      paymentStatus: 'unpaid' as const,
      notes: 'Demo Data: Proposed by AI Assistant',
      isDemo: true,
    }));

    const plan: FullEventPlan = {
      event: {
        id: eventId,
        name: req.name,
        eventType: req.eventType,
        eventDate: eventDate.toISOString().split('T')[0],
        location: req.location,
        budgetTotal: req.budgetTotal,
        currency: req.currency,
        guestCount: req.guestCount,
        themeStyle: req.themeStyle,
        culturalDietaryPreferences: req.culturalDietaryPreferences,
        accessibilityRequirements: req.accessibilityRequirements,
        specialRequirements: req.specialConstraints,
        isDemo: true,
      },
      categories,
      expenses: [],
      tasks,
      vendors,
      incidents: [],
      auditLogs: [
        {
          id: crypto.randomUUID(),
          eventId,
          action: 'PLAN_GENERATED_GEMINI',
          details: { model: modelName },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    return FullEventPlanSchema.parse(plan);
  } catch (err) {
    console.warn('Gemini plan generation failed, falling back to deterministic plan:', err);
    return generateDeterministicPlan(req);
  }
}
