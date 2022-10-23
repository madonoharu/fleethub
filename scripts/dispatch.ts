import {
  isProjectMember,
  updateImages,
  updateMasterDataBySpreadsheet,
} from "@fh/admin";

async function main() {
  if (process.env["CI"] && !process.env["ACT"]) {
    const idToken = process.env["ID_TOKEN"] || "";
    if (!(await isProjectMember(idToken))) {
      throw new Error("Unregistered user");
    }
  }

  const name = process.env["NAME"] || "";
  console.log(`Run ${name}`);
  if (name === "UPDATE_MASTER_DATA") {
    await updateMasterDataBySpreadsheet();
  } else if (name === "UPDATE_IMAGES") {
    await updateImages();
  } else {
    throw new Error(`Unknown event ${name}`);
  }
}

void main();
