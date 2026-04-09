/* module.exports = {
  transform(category, lang = 'en') {
    return {
      id: category._id,
      title: category.title.get(lang),
      slug: category.slug,
      status: category.status,
      isVerification: category.isVerification,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  transformCollection(categories, lang = 'en', parentId = null) {
    const nested = [];

    const filtered = parentId === null
      ? categories.filter(cat => !cat.parentId)
      : categories.filter(cat => String(cat.parentId) === String(parentId));

    for (const cat of filtered) {
      const transformed = this.transform(cat, lang);
      transformed.children = this.transformCollection(categories, lang, cat._id); // recursion
      nested.push(transformed);
    }

    return nested;
  }
}; */
module.exports = {
  transform(category, lang = 'en') {
    return {
      id: category._id,
      title: category.title?.[lang] || category.title?.['en'] || '',
      slug: category.slug,
      status: category.status,
      category_type: category.category_type,
      isVerification: category.isVerification,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  transformCollection(categories, lang = 'en', parentId = null) {
    const nested = [];

    const filtered = parentId === null
      ? categories.filter(cat => !cat.parentId)
      : categories.filter(cat => String(cat.parentId) === String(parentId));

    for (const cat of filtered) {
      const transformed = this.transform(cat, lang);
      transformed.children = this.transformCollection(categories, lang, cat._id);
      nested.push(transformed);
    }

    return nested;
  }
};
