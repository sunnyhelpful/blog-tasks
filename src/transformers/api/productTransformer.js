module.exports = {
    transform(product) {
      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
       
      };
    },
  
    transformCollection(products) {
      return products.map(product => this.transform(product));
    }
  };
  