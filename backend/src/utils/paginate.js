const paginate = (query) => {
  const page  = Math.max(1, Number.parseInt(query.page,  10) || 1);
  const limit = Number.parseInt(query.limit, 10) || 10;

  const safeLimit = Math.max(1, Math.min(limit, 50));
  const skip = (page - 1) * safeLimit;

  return {
    page,
    limit: safeLimit,
    skip,
  };    // used by moongoose .skip(skip).limit(limit)
};

export { paginate };