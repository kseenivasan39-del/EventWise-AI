import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguagePrompt, generateFullEventPlan } from '@/lib/ai/planningPipeline';
import { askEventCopilot } from '@/lib/ai/copilotEngine';
import { simulateCrisisRecovery, applyRecoveryProposal } from '@/lib/planning/recoveryEngine';
import { FullEventPlanSchema } from '@/types/event';
import { getSessionUser } from '@/lib/auth/session';
import { 
  listUserEvents, 
  getEventPlanById, 
  saveEventPlan, 
  deleteEventPlan 
} from '@/lib/db/repository';
import { z } from 'zod';

const RequestSchema = z.object({
  action: z.enum([
    'parse_prompt', 
    'generate_plan', 
    'ask_copilot', 
    'simulate_crisis', 
    'apply_recovery',
    'list_events',
    'get_plan',
    'save_plan',
    'delete_event'
  ]),
  payload: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req);
    const userId = sessionUser ? sessionUser.id : undefined;

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid API request payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action, payload } = parsed.data;

    switch (action) {
      // 1. Natural language parse
      case 'parse_prompt': {
        const prompt = typeof payload?.prompt === 'string' ? payload.prompt : '';
        if (!prompt) {
          return NextResponse.json({ success: false, error: 'Prompt text is required' }, { status: 400 });
        }
        const result = await parseNaturalLanguagePrompt(prompt);
        return NextResponse.json({ success: true, data: result });
      }

      // 2. Full plan generation & persistent storage
      case 'generate_plan': {
        const plan = await generateFullEventPlan(payload);
        if (userId) {
          plan.event.userId = userId;
        }
        const saved = await saveEventPlan(plan, userId);
        return NextResponse.json({ success: true, data: saved });
      }

      // 3. AI copilot
      case 'ask_copilot': {
        const { plan, query } = payload;
        const validatedPlan = FullEventPlanSchema.parse(plan);
        const result = await askEventCopilot(validatedPlan, query);
        return NextResponse.json({ success: true, data: result });
      }

      // 4. Crisis simulation
      case 'simulate_crisis': {
        const { plan, incidentType, details } = payload;
        const validatedPlan = FullEventPlanSchema.parse(plan);
        const sim = simulateCrisisRecovery(validatedPlan, incidentType, details || {});
        return NextResponse.json({ success: true, data: sim });
      }

      // 5. Apply recovery transactionally & persist
      case 'apply_recovery': {
        const { plan, incidentId, proposalId } = payload;
        const validatedPlan = FullEventPlanSchema.parse(plan);
        const updated = applyRecoveryProposal(validatedPlan, incidentId, proposalId);
        const saved = await saveEventPlan(updated, userId);
        return NextResponse.json({ success: true, data: saved });
      }

      // 6. Multi-event list
      case 'list_events': {
        const events = await listUserEvents(userId);
        return NextResponse.json({ success: true, data: events });
      }

      // 7. Get specific event plan
      case 'get_plan': {
        const eventId = payload?.eventId;
        if (!eventId) {
          return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
        }
        const plan = await getEventPlanById(eventId, userId);
        if (!plan) {
          return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: plan });
      }

      // 8. Explicit save plan
      case 'save_plan': {
        const validatedPlan = FullEventPlanSchema.parse(payload?.plan);
        const saved = await saveEventPlan(validatedPlan, userId);
        return NextResponse.json({ success: true, data: saved });
      }

      // 9. Delete event
      case 'delete_event': {
        const eventId = payload?.eventId;
        if (!eventId) {
          return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
        }
        await deleteEventPlan(eventId, userId);
        return NextResponse.json({ success: true, message: 'Event deleted' });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === 'FORBIDDEN_EVENT_ACCESS') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to access or modify this event' },
        { status: 403 }
      );
    }
    console.error('API Error in /api/events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred processing your event request',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req);
    const userId = sessionUser ? sessionUser.id : undefined;
    const events = await listUserEvents(userId);
    return NextResponse.json({ success: true, data: events });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
