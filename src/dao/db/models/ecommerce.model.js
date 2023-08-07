import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import mongoosePaginate from "mongoose-paginate-v2";

/* This code is defining a Mongoose schema for a product. It includes various fields such as id, title,
description, code, price, status, stock, category, and thumbnail. Each field has a specific data
type and some have additional requirements such as being required or having a minimum value. The
schema also includes timestamps for when the product was created and updated. */
const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      min: 0,
    },
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: false,
    },
    Code: {
      type: String,
      required: false,
    },
    Price: {
      type: Number,
      required: false,
      min: 0,
    },
    Status: {
      type: Boolean,
      required: false,
    },
    Stock: {
      type: Number,
      required: false,
      min: 0,
    },
    Category: {
      type: String,
      required: false,
      default: "Ropa",
    },
    Owner: {
      type: String,
      required: false,
      default: "ADMIN",
    },
    Thumbnail: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

/* This code is defining a Mongoose schema for a shopping cart. It includes fields such as id,
products, and timestamp. The products field is an array of objects, each containing a product ID
(referenced from the Product model), a quantity, and a unique ID for the product in the cart. The
schema also includes the mongoose-delete plugin to enable soft deletion of cart items. */
const CartSchema = new mongoose.Schema({
  // id: {
  //     type: Number,
  //     required: true,
  // },
  uid: {
    type: String,
    required: true,
  },
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        Quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        pid: {
          type: Number,
          default: 0,
          min: 0,
        },
        _pid: {
          type: mongoose.Schema.Types.ObjectId,
        },
        totlinea: {
          type: Number,
          default: 0,
        },
        // Title: {
        //     type: String,
        //     default: "",
        // },
      },
    ],
    default: [],
  },
  timestamp: { type: String },
});

CartSchema.pre("findOne", function () {
  this.populate("products.product");
});

/* This code is defining a Mongoose schema for a chat message. It includes fields such as userEmail,
message, and date. The userEmail and message fields are required and have a data type of string. The
date field has a data type of string and a default value of the current date and time. It also
includes a custom validation function for the date field, which can be used to validate the date
format or range. */
const ChatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  date: {
    type: String,
    default: Date.now,
    validate: {
      validator: function (value) {
        return true;
      },
      message: "Invalid date",
    },
  },
});

/* This code is defining a pre-save hook for the ProductSchema. This hook is executed before a product
is saved to the database. It checks if the product has a Category field and if it does, it converts
the first letter of the category to uppercase and the rest of the letters to lowercase. This ensures
that the category is consistently formatted in a standardized way before it is saved to the
database. The `next()` function is called to move on to the next middleware function in the stack. */
ProductSchema.pre("save", function (next) {
  if (this.Category) {
    //this.Category = this.Category.toLowerCase();
    this.Category = this.Category.charAt(0).toUpperCase() + this.Category.slice(1).toLowerCase();
  }
  next();
});

/* This code is defining a Mongoose schema for a user. It includes fields such as first_name,
last_name, userEmail, age, password, and date. Each field has a specific data type and some have
additional requirements such as being required or having a unique value. The schema also includes a
custom validation function for the date field, which can be used to validate the date format or
range. This schema can be used to create a User model in the database. */
const UserSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    password: String,
    loggedBy: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number,
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "CartSchema" },
    roll: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN", "PREMIUM"],
    },
    date: {
      type: String,
      default: Date.now,
      validate: {
        validator: function (value) {
          return true;
        },
        message: "Invalid date",
      },
    },
    status: { type: Boolean, default: false },
    documents: [
      {
        name: String,
        reference: String,
        doctype: String,
      },
    ],
    imageProfile: String,
    last_connection: Date,
  },
  {
    timestamps: true,
  }
);

const TicketSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    purchase_datetime: { type: Date, default: Date.now, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
    uid: { type: mongoose.Schema.Types.ObjectId },
    products: {
      type: [
        {
          Quantity: {
            type: Number,
            default: 0,
            min: 0,
          },
          _pid: {
            type: mongoose.Schema.Types.ObjectId,
          },
          Total: {
            type: Number,
            default: 0,
          },
          Price: {
            type: Number,
            default: 0,
            min: 0,
          },
          Title: {
            type: String,
            default: "",
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

TicketSchema.plugin(mongooseDelete, { deletedAt: true });
const TicketModel = new mongoose.model("tickets", TicketSchema);

UserSchema.plugin(mongooseDelete, { deletedAt: true });
const UserModel = new mongoose.model("users", UserSchema);

CartSchema.plugin(mongooseDelete, { deletedAt: true });
const CartModel = new mongoose.model("Cart", CartSchema);

ProductSchema.plugin(mongooseDelete, { deletedAt: true });
ProductSchema.plugin(mongoosePaginate);
const ProductModel = mongoose.model("Product", ProductSchema);

ChatSchema.plugin(mongooseDelete, { deletedAt: true });
const ChatModel = mongoose.model("Messages", ChatSchema);

export { TicketModel, ProductModel, CartModel, ChatModel, UserModel };
export default UserModel;
