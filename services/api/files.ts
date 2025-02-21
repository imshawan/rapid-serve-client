

export const files = {
  fetchFiles: async (page: number, limit: number = 20) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const totalItems = 100;
    const start = (page - 1) * limit;
    const end = start + limit;

    const mockFiles = Array.from({ length: Math.min(limit, totalItems - start) }, (_, i) => ({
      id: `file-${start + i}`,
      name: `File ${start + i + 1}.pdf`,
      type: Math.random() > 0.5 ? 'pdf' : 'folder',
      size: `${Math.floor(Math.random() * 10)}MB`,
      modified: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      path: `/documents/file-${start + i}`,
      isStarred: Math.random() > 0.8,
      isDeleted: false,
    }));

    return {
      files: mockFiles,
      totalPages: Math.ceil(totalItems / limit),
      hasMore: end < totalItems,
    };
  }
}