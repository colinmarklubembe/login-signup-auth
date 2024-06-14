import { Router } from "express";
import deleteUserAndRelatedData from "../../utils/deleteUserAndRelatedData";

const router = Router();

router.delete("/delete-user/:id", async (req, res) => {
  const { id } = req.params;

  const deletedUser = await deleteUserAndRelatedData.deleteUserAndRelatedData(
    res,
    id
  );
  console.log("User deleted successfully", deletedUser);
});

export default router;
