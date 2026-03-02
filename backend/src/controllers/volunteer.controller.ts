import { Response, NextFunction } from 'express';
import { VolunteerService } from '../services/volunteer.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PDFUtils } from '../utils/pdf';
import prisma from '../config/database';

export const logHours = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const hour = await VolunteerService.logHours(userId, req.body);

    res.status(201).json({
      success: true,
      data: hour,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserHours = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await VolunteerService.getUserHours(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.hours,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingHours = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await VolunteerService.getPendingHours(page, limit);

    res.status(200).json({
      success: true,
      data: result.hours,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHourStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user!.sub;

    const updatedHour = await VolunteerService.updateHourStatus(id as string, status, approvedBy);

    res.status(200).json({
      success: true,
      data: updatedHour,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const stats = await VolunteerService.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const stats = await VolunteerService.getUserStats(userId);
    
    if (stats.totalHours === 0) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Henüz onaylanmış gönüllülük saatiniz bulunmadığı için sertifika oluşturulamaz.' } 
      });
    }

    PDFUtils.generateCertificate(res, user, stats);
  } catch (error) {
    next(error);
  }
};
