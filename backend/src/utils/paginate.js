const paginate = (query) => {
  const page  = Number.parseInt(query.page,  10) || 1;   // default: page 1
  const limit = Number.parseInt(query.limit, 10) || 10;  // default: 10 per page

  const safeLimit = Math.min(limit, 50);
  const skip = (page - 1) * safeLimit;

  return {
    page,
    limit: safeLimit,
    skip,
  };    // used by moongoose .skip(skip).limit(limit)
};

export { paginate };