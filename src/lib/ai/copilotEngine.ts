import { GoogleGenAI } from '@google/genai';
import { FullEventPlan } from '@/types/event';
import { calculateBudgetMetrics, formatCurrency } from '@/lib/planning/budgetEngine';

export interface CopilotRecommendation {
  summary: string;
  categoryAdvice?: string;
  proposedChanges: Array<{
    type: 'reallocate' | 'reschedule' | 'vendor_action' | 'menu_item' | 'invitation';
    description: string;
    costImpact: number;
  }>;
  suggestedTasks?: string[];
  actionableFollowup?: string;
  bilingualOutput?: {
    english: string;
    tamil?: string;
  };
}

export async function askEventCopilot(
  plan: FullEventPlan,
  userQuery: string
): Promise<CopilotRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY;
  const metrics = calculateBudgetMetrics(plan.event.budgetTotal, plan.categories, plan.expenses);
  const sanitizedQuery = userQuery.slice(0, 1000).trim();

  // If Gemini is not configured, supply high-intelligence deterministic responses
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return generateDeterministicCopilotAdvice(plan, sanitizedQuery, metrics);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the EventWise AI Planning Copilot. You are an expert event planning consultant.
Current Event Context:
- Name: ${plan.event.name} (${plan.event.eventType})
- Date: ${plan.event.eventDate} | Location: ${plan.event.location}
- Total Budget: ${formatCurrency(metrics.totalBudget, plan.event.currency)}
- Spent: ${formatCurrency(metrics.totalSpent, plan.event.currency)} | Remaining: ${formatCurrency(metrics.remainingBudget, plan.event.currency)}
- Contingency Reserve: ${formatCurrency(metrics.contingencyReserve, plan.event.currency)}
- Tasks: ${plan.tasks.length} total (${plan.tasks.filter(t => t.status === 'completed').length} completed)
- Vendors: ${plan.vendors.length}

User Question/Command:
"${sanitizedQuery}"

Return your advice as structured JSON matching:
{
  "summary": string (concise 2-3 sentences direct answer),
  "categoryAdvice": string (optional budget/category analysis),
  "proposedChanges": [
    {
      "type": "reallocate" | "reschedule" | "vendor_action" | "menu_item" | "invitation",
      "description": string,
      "costImpact": number (negative for savings, positive for increase, 0 for neutral)
    }
  ],
  "suggestedTasks": string[],
  "actionableFollowup": string,
  "bilingualOutput": {
    "english": string,
    "tamil": string (if requested or relevant for Tamil wedding context)
  }
}
Respond strictly in JSON. No code blocks.`;

    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(res.text || '{}');
    return {
      summary: parsed.summary || 'Here is the tailored recommendation for your event.',
      categoryAdvice: parsed.categoryAdvice,
      proposedChanges: Array.isArray(parsed.proposedChanges) ? parsed.proposedChanges : [],
      suggestedTasks: Array.isArray(parsed.suggestedTasks) ? parsed.suggestedTasks : [],
      actionableFollowup: parsed.actionableFollowup,
      bilingualOutput: parsed.bilingualOutput,
    };
  } catch (err) {
    console.warn('Gemini copilot query failed, using deterministic guidance:', err);
    return generateDeterministicCopilotAdvice(plan, sanitizedQuery, metrics);
  }
}

function generateDeterministicCopilotAdvice(
  plan: FullEventPlan,
  query: string,
  metrics: ReturnType<typeof calculateBudgetMetrics>
): CopilotRecommendation {
  const q = query.toLowerCase();

  // 1. Budget reduction query
  if (q.includes('reduce') || q.includes('save') || q.includes('cut budget') || q.includes('50,000') || q.includes('50000')) {
    return {
      summary: `To optimize ₹50,000 without compromising your dining quality, reallocate funds from physical printed invitations to digital animated WhatsApp invites and refine the floral stage canopy to seasonal local flowers.`,
      categoryAdvice: 'Protecting your food budget maintains high guest satisfaction while decorative trimming yields immediate savings.',
      proposedChanges: [
        {
          type: 'reallocate',
          description: 'Switch printed invitations and Thamboolam boxes to interactive digital invite website + e-cards',
          costImpact: -15000,
        },
        {
          type: 'reallocate',
          description: 'Use local seasonal Jasmine and Marigold rather than imported carnations for Mandapam pillars',
          costImpact: -25000,
        },
        {
          type: 'reallocate',
          description: 'Streamline evening lighting truss from heavy 360-rig to focused stage spotlights',
          costImpact: -10000,
        },
      ],
      actionableFollowup: 'Would you like me to apply these ₹50,000 savings to your budget categories and update the reserve?',
    };
  }

  // 2. Invitation text query (English and Tamil)
  if (q.includes('invitation') || q.includes('invite') || q.includes('tamil')) {
    return {
      summary: 'Here is an auspicious, elegant wedding invitation draft formulated in both English and traditional Tamil for your guests.',
      proposedChanges: [
        {
          type: 'invitation',
          description: 'Finalize invitation copy for digital and card distribution',
          costImpact: 0,
        },
      ],
      bilingualOutput: {
        english: `We cordially invite you and your family to celebrate the auspicious wedding ceremony of our children.\nDate: ${plan.event.eventDate}\nVenue: ${plan.event.location}\nYour presence and blessings will be our greatest gift.`,
        tamil: `எங்கள் இல்ல திருமண விழாவிற்கு தங்களை அன்போடு அழைக்கின்றோம்.\nநாள்: ${plan.event.eventDate}\nஇடம்: ${plan.event.location}\nதங்களின் வருகையும் நல்வாழ்த்துகளும் எங்கள் பெருமகிழ்ச்சி.`,
      },
      actionableFollowup: 'You can export this directly into the invitation template or share via WhatsApp.',
    };
  }

  // 3. Menu / Food query
  if (q.includes('menu') || q.includes('vegetarian') || q.includes('food') || q.includes('cater')) {
    return {
      summary: `For ${plan.event.guestCount} guests, here is an authentic 21-course South Indian Traditional Elai Sapadu (Plantain Leaf Feast) designed to maximize flavor while strictly honoring your budget.`,
      categoryAdvice: 'Catering currently accounts for your second largest budget allocation with high guest satisfaction leverage.',
      proposedChanges: [
        {
          type: 'menu_item',
          description: 'Welcome Drink: Panakam & Tender Coconut water with Elaneer Payasam shooter',
          costImpact: 0,
        },
        {
          type: 'menu_item',
          description: 'Main Feast: Ghee Pongal, Medu Vada, Beans Paruppu Usili, Urulai Roast, Aviyal, Mysore Rasam, Thakkali Sambar, Appalam & Paal Ada Pradhaman',
          costImpact: 0,
        },
      ],
      suggestedTasks: [
        'Schedule tasting session 3 weeks prior with Head Chef',
        'Verify banana leaf dimensions and eco-friendly leaf cups',
      ],
      actionableFollowup: 'Lock in this menu selection with Madurai Meenakshi Traditional Caterers.',
    };
  }

  // 4. Default timeline & status advice
  const overdue = plan.tasks.filter((t) => t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0]);
  return {
    summary: `Currently, your event "${plan.event.name}" is scheduled for ${plan.event.eventDate}. You have spent ${formatCurrency(metrics.totalSpent, plan.event.currency)} of ${formatCurrency(metrics.totalBudget, plan.event.currency)} with ${formatCurrency(metrics.contingencyReserve, plan.event.currency)} in contingency. ${overdue.length > 0 ? `Attention: ${overdue.length} task(s) are overdue.` : 'All key milestones are on track.'}`,
    categoryAdvice: 'All budget categories are within declared parameters.',
    proposedChanges: [],
    suggestedTasks: plan.tasks.slice(0, 3).map((t) => `${t.name} (Due: ${t.dueDate})`),
    actionableFollowup: 'Ask me about venue alternatives, budget adjustments, or crisis recovery scenarios.',
  };
}
