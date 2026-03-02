import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import logger from '../utils/logger';
import { PDFUtils } from '../utils/pdf';

export class AdminController {
  async getVolunteers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;

      const data = await AdminService.getAllVolunteers(page, limit, search);
      res.json({ success: true, data: data.users, meta: data.pagination });
    } catch (error: any) {
      logger.error('AdminController getVolunteers error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await AdminService.toggleUserStatus(id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error('AdminController toggleStatus error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await AdminService.deleteUser(id);
      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error: any) {
      logger.error('AdminController deleteUser error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.sub as string;
      const event = await AdminService.createEvent(req.body, creatorId);
      res.status(201).json({ success: true, data: event });
    } catch (error: any) {
      logger.error('AdminController createEvent error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await AdminService.updateEvent(id, req.body);
      res.json({ success: true, data: event });
    } catch (error: any) {
      logger.error('AdminController updateEvent error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await AdminService.deleteEvent(id);
      res.json({ success: true, message: 'Event deactivated successfully' });
    } catch (error: any) {
      logger.error('AdminController deleteEvent error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const report = await AdminService.getVolunteerReport();
      res.json({ success: true, data: report });
    } catch (error: any) {
      logger.error('AdminController getReport error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getReportCSV(req: Request, res: Response) {
    try {
      const report = await AdminService.getVolunteerReport();
      
      const headers = ['Volunteer', 'Email', 'School', 'Project', 'Hours', 'Date'];
      const rows = report.map(h => [
        h.volunteer,
        h.email,
        h.school || '',
        h.project,
        h.hours,
        h.date
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=volunteer_report_${new Date().toISOString().split('T')[0]}.csv`);
      res.status(200).send(csv);
    } catch (error: any) {
      logger.error('AdminController getReportCSV error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getReportPDF(req: Request, res: Response) {
    try {
      const report = await AdminService.getVolunteerReport();
      PDFUtils.generateVolunteerReport(res, report);
    } catch (error: any) {
      logger.error('AdminController getReportPDF error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async sendAnnouncement(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.sub as string;
      const result = await AdminService.createAnnouncement(req.body, creatorId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('AdminController sendAnnouncement error:', error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}

export default new AdminController();
