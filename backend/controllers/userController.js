import User from "../models/User.js";

export const deleteAccount = async (req, res) => {
  try {
    const id   = req.user.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, imgUrl } = req.body;
    const id = req.user.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = String(firstName).trim();
    if (lastName  !== undefined) updates.lastName  = String(lastName).trim();
    if (imgUrl    !== undefined) updates.imgUrl     = String(imgUrl).trim();

    await User.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getUser = async (req, res) => {
  try {
    const id   = req.user.id;
    const user = await User.findById(id).select("firstName lastName imgUrl email providers");

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        imgUrl:    user.imgUrl,
        providers: user.providers.map((p) => p.provider),
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
