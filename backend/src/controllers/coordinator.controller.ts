import { Request, Response } from 'express';
import { VolunteerService } from '../services/volunteer.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { NotificationService } from '../services/notification.service';
import logger from '../utils/logger';
import { HourStatus } from '@prisma/client';

export class CoordinatorController {
  async getPendingHours(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const { hours, pagination } = await VolunteerService.getPendingHours(page, limit);

      res.json({
        success: true,
        data: hours,
        meta: pagination,
      });
    } catch (error: any) {
      logger.error('CoordinatorController getPendingHours error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pending hours' },
      });
    }
  }

  async updateHourStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const coordinatorId = (req as any).user.sub as string;

      if (![HourStatus.APPROVED, HourStatus.REJECTED].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid status' },
        });
      }

      const updatedHour = await VolunteerService.updateHourStatus(id, status, coordinatorId);

      // Notify User
      const statusText = status === HourStatus.APPROVED ? 'onaylandı' : 'reddedildi';
      await NotificationService.notifyUser(
        updatedHour.userId,
        'Gönüllülük Saati Durumu',
        `${updatedHour.projectName} saatiniz ${statusText}.`,
        { type: 'HOUR_UPDATE', status, id: updatedHour.id }
      );

      // Invalidate leaderboard cache if hours approved
      if (status === HourStatus.APPROVED) {
        await LeaderboardService.invalidateCache();
      }

      res.json({
        success: true,
        data: updatedHour,
      });
    } catch (error: any) {
      logger.error('CoordinatorController updateHourStatus error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
      });
    }
  }
}

export default new CoordinatorController();
