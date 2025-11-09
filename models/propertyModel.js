import mongoose from "mongoose";
import { type } from "os";

const propertySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    listingType: { type: String, default: "" },
    propertyType: {type: String, default: ""},
    price: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    blockNumber: { type: String }, // e.g., A1, B2, Flat 3

    location: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        coordinate: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },

    features: {
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        toilets: { type: Number },
        parkingSpaces: { type: Number },
        size: { type: Number },
        yearBuilt: { type: Number },
        furnishing: { type: String },
        amenities: { type: String },
        extras: { type: String }
    },

    media: {
        images: [
    {
      url: { type: String },
      public_id: { type: String }
    }
  ],
  videos: [
    {
      url: { type: String},
      public_id: { type: String }
    }
  ]
},

    contact: {
        listedBy: { type: String },
        contactName: { type: String },
        contactNumber: { type: Number },
        contactEmail: { type: String },
        agency: { type: String }
    },

    metadata: {
        dateListed: { type: Date, default: Date.now },
        isVerified: { type: Boolean },
        views: { type: Number, default: 0 },
        status: { type: String, default: "active" }
    },

    condition: {
        type: String,
        enum: ["new", "old", "uncompleted"],
        default: ""
    },

    status: {
        type: String,
        enum: ["available", "negotiation", "rented", "unavailable",],
        default: "available"
    },

    ownership: {
        type: String,
        enum: ["agent", "helper", "owner"],
        default: ""
    },

    dispute: {
        openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        evidenceUrl: { type: String },
        openedAt: { type: Date },
        winner: {type: String, default: ""}
    }

},
{ 
    timestamps: true 
});


export default mongoose.model("Property", propertySchema);

