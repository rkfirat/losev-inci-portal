import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as eventService from '../services/event.service';

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
    const result = await eventService.listEvents(req.query as any);
    res.json({ status: 'success', data: result });
});

export const getEventDetail = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventDetail(req.params.id, req.user!.id);
    res.json({ status: 'success', data: event });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.createEvent(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: event });
});

export const participateEvent = asyncHandler(async (req: Request, res: Response) => {
    const result = await eventService.participateEvent(req.params.id, req.user!.id);
    res.json({ status: 'success', data: result });
});

export const cancelParticipation = asyncHandler(async (req: Request, res: Response) => {
    const result = await eventService.cancelParticipation(req.params.id, req.user!.id);
    res.json({ status: 'success', data: result });
});
