import express from 'express';
import bedsRouter from './beds.js';
import appointmentsRouter from './appointments.js';
import prescriptionsRouter from './prescriptions.js';
import invoicesRouter from './invoices.js';
import patientsRouter from './patients.js';
import doctorsRouter from './doctors.js';
import branchesRouter from './branches.js';
import hospitalsRouter from './hospitals.js';
import ticketsRouter from './tickets.js';
import fluidsRouter from './fluids.js';
import handoffsRouter from './handoffs.js';
import branchAdminsRouter from './branchAdmins.js';
import inventoryRouter from './inventory.js';
import auditLogsRouter from './auditLogs.js';
import notificationsRouter from './notifications.js';
import licensesRouter from './licenses.js';
import usersRouter from './users.js';
import staffRouter from './staff.js';
import staffAdminsRouter from './staffAdmins.js';

const router = express.Router();

// Bed CRUD
router.use('/beds', bedsRouter);

// Appointment CRUD
router.use('/appointments', appointmentsRouter);

// Prescription CRUD
router.use('/prescriptions', prescriptionsRouter);

// Invoice CRUD
router.use('/invoices', invoicesRouter);

// Patient CRUD
router.use('/patients', patientsRouter);

// Doctor CRUD
router.use('/doctors', doctorsRouter);

// Branch CRUD
router.use('/branches', branchesRouter);

// Hospital CRUD
router.use('/hospitals', hospitalsRouter);

// Tickets CRUD
router.use('/tickets', ticketsRouter);

// Fluids CRUD
router.use('/fluids', fluidsRouter);

// Handoffs CRUD
router.use('/handoffs', handoffsRouter);

// Branch Admins CRUD
router.use('/branchAdmins', branchAdminsRouter);

// Inventory CRUD
router.use('/inventory', inventoryRouter);

// Audit Logs CRUD
router.use('/auditLogs', auditLogsRouter);

// Notifications CRUD
router.use('/notifications', notificationsRouter);

// Licenses CRUD
router.use('/licenses', licensesRouter);

// Users CRUD
router.use('/users', usersRouter);

// Staff CRUD
router.use('/staff', staffRouter);

// Staff Admins CRUD
router.use('/staffAdmins', staffAdminsRouter);

export default router;
