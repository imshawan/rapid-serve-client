import { Types } from "mongoose";
import { Shared } from "../models/shared";
import { File } from "../models/upload";
import { User } from "../models/user";

export const getSharedFilesPopulated = async ({
  query = {},
  page = 1,
  limit = 10,
  sharedWithMe = false,
}: {
  query: Record<string, any>;
  page: number;
  limit: number;
  sharedWithMe?: boolean
}): Promise<SharedFilePopulated[] | []> => {
  if (!query || !Object.keys(query).length) {
    return [];
  }
  
  const skip = (page - 1) * limit;
  const sharedFiles = await Shared.find(query)
    .populate<{
      sharedWith: {
        userId: Partial<User>;
        accessLevel: "viewer" | "editor" | "full";
        sharedAt: Date;
      }[];
    }>("sharedWith.userId", "_id name email profilePicture")
    .skip(skip)
    .limit(limit)
    .lean();

  const fileIds = sharedFiles.map((sf) => sf.fileId); // Get all file UUIDs
  const userIds = sharedFiles.map((sf) => sf.ownerId);
  const promises: Promise<any>[] = [
    File.find({ fileId: { $in: fileIds } }, "fileId fileName fileSize type status").lean(),
  ]
  if (sharedWithMe) {
    promises.push(User.find({ _id: { $in: userIds } }, "_id name email profilePicture").lean())
  }

  const [files, users] = await Promise.all(promises)

  // Attach file data to sharedFiles
  const fileMap = new Map(files.map((f: Shared) => [f.fileId, f]));
  const userMap = new Map(users?.map((u: User) => [String(u._id), u]));
  sharedFiles.forEach((sf: any) => {
    sf.fileId = fileMap.get(sf.fileId) || null;
    if (sharedWithMe) {
      let owner = userMap.get(String(sf.ownerId))
      sf.sharedBy = owner ? [owner] : [];
    }
  });

  return sharedFiles.map(parseSharedFile);
};

export const getSharedFilePopulated = async (query: Record<string, any>): Promise<SharedFilePopulated | null> => {
  if (!query || !Object.keys(query).length) return null;

  const sharedFile = await Shared.findOne(query)
    .select("-passwordHash")
    .populate<{ sharedWith: { userId: Partial<User>; accessLevel: "viewer" | "editor" | "full"; sharedAt: Date }[] }>(
      "sharedWith.userId",
      "_id name email"
    )
    .lean();

  if (!sharedFile) return null;

  const fileDetails = await File.findOne({ fileId: sharedFile.fileId }, "fileId fileName fileSize type status").lean() as any

  sharedFile.fileId = fileDetails || null;

  return parseSharedFile(sharedFile)
};

export const getSharedFilesCount = async (query: Record<string, any> = {}): Promise<number> => {
  if (!query || !Object.keys(query).length) {
    return 0
  }

  return Shared.countDocuments(query)
}

function parseSharedFile(sf: any): SharedFilePopulated {
  return {
    ...sf,
    fileSize: sf.fileId?.fileSize || 0,
    fileType: sf.fileId?.type || "file",
    fileId: String(sf.fileId?.fileId),
    sharedWith: sf.sharedWith.map((user: SharedWithUser) => ({
      userId: new Types.ObjectId(String(user.userId._id)),
      name: (user.userId as { name: string }).name ?? "Unknown",
      email: (user.userId as { email: string }).email ?? "Unknown",
      profilePicture: (user.userId as { profilePicture: string }).profilePicture ?? "",
      accessLevel: user.accessLevel,
      sharedAt: user.sharedAt,
    })),
  }
}