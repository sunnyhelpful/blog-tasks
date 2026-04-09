module.exports = {
  transform(category, lang = 'en') {
    return {
      id: category._id,
      title: category.title?.[lang] || category.title?.['en'] || '',
      slug: category.slug,
      status: category.status,
      isVerification: category.isVerification,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  transformCollection(categories, lang = 'en') {
    return categories.map(category => this.transform(category, lang));
  }
};