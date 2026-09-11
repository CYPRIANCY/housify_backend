import Verification, { ID_TYPES } from "../models/verification.js";
import User from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const uploadMany = async (files, folder) => {
  const out = [];

  for (const file of files || []) {
    const result = await uploadToCloudinary(
      file.buffer,
      folder,
      "auto"
    );

    out.push({
      label: file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  return out;
};

export const submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { idType } = req.body;

    if (!ID_TYPES.includes(idType)) {
      return res.status(400).json({ message: `idType must be one of: ${ID_TYPES.join(', ')}` });
    }

    // files grouped by multer.fields()
    const idFiles = req.files?.idDocs || [];
    if (!idFiles.length) return res.status(400).json({ message: 'At least one ID document is required' });

    const idDocs = await uploadMany(idFiles, 're_platform/verification/id');
    let proofDocs = [];
    if (user.role === 'landlord') {
      const proofFiles = req.files?.proofDocs || [];
      if (!proofFiles.length) {
        return res.status(400).json({ message: 'Landlords must upload proof of ownership' });
      }
      proofDocs = await uploadMany(proofFiles, 're_platform/verification/proof');
    } else {
      // tenant may optionally upload extra docs (ignored if absent)
      const proofFiles = req.files?.proofDocs || [];
      if (proofFiles.length) {
        proofDocs = await uploadMany(proofFiles, 're_platform/verification/proof');
      }
    }

    // Invalidate prior pending submissions? Keep history; only latest matters for badge
    const verif = await Verification.create({
      user: user._id,
      roleAtSubmission: user.role,
      idType,
      idDocuments: idDocs,
      proofOfOwnership: proofDocs,
      status: 'pending'
    });

    // Optional: flip a lightweight status on user for quick UI
    user.kycStatus = 'pending';
    await user.save();

    res.status(201).json({ message: 'Verification submitted', verification: verif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submit failed', error: err.message });
  }
};

// GET /api/verification/me — latest submission + status
export const getMyVerification = async (req, res) => {
  try {
    const latest = await Verification.findOne({ user: req.user._id })
      .sort({ submittedAt: -1 });
    res.json({ verification: latest || null });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// DELETE /api/verification/:verificationId/document
// Body: { section: 'idDocuments'|'proofOfOwnership', public_id }
export const deleteVerificationDocument = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { section, public_id } = req.body;

    const v = await Verification.findOne({ _id: verificationId, user: req.user._id });
    if (!v) return res.status(404).json({ message: 'Verification not found' });
    if (!['idDocuments','proofOfOwnership'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // remove from cloud & array
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
      v[section] = v[section].filter(d => d.public_id !== public_id);
      await v.save();
    }
    res.json({ message: 'Document removed', verification: v });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
