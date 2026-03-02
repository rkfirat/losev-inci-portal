"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = __importDefault(require("../services/event.service"));
class EventController {
    async getAllEvents(req, res) {
        try {
            const events = await event_service_1.default.getAllEvents();
            res.json({ success: true, data: events });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async getEventById(req, res) {
        try {
            const id = req.params.id;
            const userId = req.user?.id;
            const event = await event_service_1.default.getEventById(id, userId);
            if (!event) {
                return res.status(404).json({ success: false, error: { message: 'Event not found' } });
            }
            res.json({ success: true, data: event });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async participate(req, res) {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            const participation = await event_service_1.default.participate(id, userId);
            res.json({ success: true, data: participation });
        }
        catch (error) {
            if (error.message === 'EVENT_NOT_FOUND') {
                return res.status(404).json({ success: false, error: { message: 'Event not found' } });
            }
            if (error.message === 'EVENT_FULL') {
                return res.status(400).json({ success: false, error: { message: 'Event is full' } });
            }
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async cancelParticipation(req, res) {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            const participation = await event_service_1.default.cancelParticipation(id, userId);
            res.json({ success: true, data: participation });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.EventController = EventController;
exports.default = new EventController();
