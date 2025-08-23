import mongoose from 'mongoose';

export const ID_TYPES = ['passport', 'national_id', 'driver_license', 'voter_card'];

const verificationDocSchema = new mongoose.Schema({
  label: String,               // e.g. "Front side", "Back side", "Selfie", "Title Deed"
  url: String,
  public_id: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roleAtSubmission: { type: String, enum: ['tenant', 'landlord'], required: true },

  // user chooses an ID type
  idType: { type: String, enum: ID_TYPES, required: true },

  // core ID files (front/back/selfie etc.)
  idDocuments: [verificationDocSchema],

  // landlord-only
  proofOfOwnership: [verificationDocSchema], // optional for tenants; required for landlords

  // workflow
  status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'pending', index: true },
  notes: String,
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // audit
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

export default mongoose.model('Verification', verificationSchema);
