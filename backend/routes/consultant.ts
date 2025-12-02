/**
 * Consultant Site Routes
 * Handles white-label consultant portal creation and management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface ConsultantCreateRequest {
  consultantEmail: string;
  brandName: string;
  subdomain: string;
  customLogo?: string;
}

router.post('/create', async (req: Request, res: Response) => {
  const { consultantEmail, brandName, subdomain } = req.body as ConsultantCreateRequest;

  if (!consultantEmail || !brandName || !subdomain) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // TODO: Create consultant site in database using Prisma
    console.log(`[CONSULTANT] Creating site for ${consultantEmail}`);

    return res.json({
      success: true,
      siteId: uuidv4(),
      subdomain: `${subdomain}.infinitysol.com`,
      message: 'Consultant site created successfully'
    });
  } catch (error) {
    console.error('[CONSULTANT ERROR]', error);
    return res.status(500).json({ error: 'Failed to create consultant site' });
  }
});

router.get('/:subdomain', async (req: Request, res: Response) => {
  const { subdomain } = req.params;

  try {
    // TODO: Fetch consultant site from database
    console.log(`[CONSULTANT] Fetching site: ${subdomain}`);

    return res.json({
      success: true,
      site: {
        subdomain,
        brandName: 'Example Consulting',
        isActive: true
      }
    });
  } catch (error) {
    console.error('[CONSULTANT ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch consultant site' });
  }
});

export default router;
