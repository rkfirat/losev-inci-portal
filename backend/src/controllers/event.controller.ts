import { Request, Response } from 'express';
import eventService from '../services/event.service';

export class EventController {
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id as string | undefined;
      const event = await eventService.getEventById(id, userId);
      
      if (!event) {
        return res.status(404).json({ success: false, error: { message: 'Event not found' } });
      }
      
      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async participate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.sub as string;
      
      const participation = await eventService.participate(id, userId);
      res.json({ success: true, data: participation });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ success: false, error: { message: 'Event not found' } });
      }
      if (error.message === 'EVENT_FULL') {
        return res.status(400).json({ success: false, error: { message: 'Event is full' } });
      }
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async cancelParticipation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.sub as string;
      
      const participation = await eventService.cancelParticipation(id, userId);
      res.json({ success: true, data: participation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}

export default new EventController();
