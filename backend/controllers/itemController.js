import Item from "../models/Item.js";

// Picks only the allowed fields from the request body and
// makes sure discountPercentage is stored as a number.
const buildItemData = (body) => {
  const data = {
    name: body.name,
    category: body.category,
    price: body.price,
    description: body.description,
    imageUrl: body.imageUrl,
  };

  if (body.discountPercentage !== undefined && body.discountPercentage !== "") {
    data.discountPercentage = Number(body.discountPercentage);
  }

  // Remove fields that were not sent (important for updates)
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return data;
};

export const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item" });
  }
};

export const createItem = async (req, res) => {
  try {
    const newItem = await Item.create(buildItemData(req.body));
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create item",
      error: error.message,
    });
  }
};

export const updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, buildItemData(req.body), {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update item",
      error: error.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item" });
  }
};