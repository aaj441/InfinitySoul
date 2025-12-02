/**
 * Evidence Vault Routes
 * Handles secure document storage and retrieval
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface EvidenceUploadRequest {
  customerId: string;
  fileType: string;
  fileName: string;
}

router.post('/upload', async (req: Request, res: Response) => {
  const { customerId, fileType, fileName } = req.body as EvidenceUploadRequest;

  if (!customerId || !fileType || !fileName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // TODO: Upload to S3 and save metadata to database
    console.log(`[EVIDENCE] Uploading ${fileName} for customer ${customerId}`);

    const fileId = uuidv4();
    const filePath = `evidence/${customerId}/${fileId}/${fileName}`;

    return res.json({
      success: true,
      fileId,
      filePath,
      message: 'Evidence file uploaded successfully'
    });
  } catch (error) {
    console.error('[EVIDENCE ERROR]', error);
    return res.status(500).json({ error: 'Failed to upload evidence file' });
  }
});

router.get('/:customerId', async (req: Request, res: Response) => {
  const { customerId } = req.params;

  try {
    // TODO: Fetch all evidence files for customer from database
    console.log(`[EVIDENCE] Fetching files for customer: ${customerId}`);

    return res.json({
      success: true,
      files: []
    });
  } catch (error) {
    console.error('[EVIDENCE ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch evidence files' });
  }
});

export default router;
