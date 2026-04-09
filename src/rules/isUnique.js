const isUnique = async (value, { req, model, field }) => {
    const { id } = req.params;

    try {
        if (id) {
            const existingDoc = await model.findById(id);
            if (!existingDoc) return Promise.reject("Document not found!");
            if (value === existingDoc[field]) return Promise.resolve();
        }

        const existingDoc = await model.findOne({
            [field]: { $regex: new RegExp(`^${value}$`, 'i') },
            isDeleted: false,
            _id: { $ne: id || null }
        });
        
        if (existingDoc) {
            return Promise.reject(`${field} is already in use!`);
        }

        return Promise.resolve();
    } catch (error) {
        return Promise.reject("Error checking uniqueness");
    }
};

module.exports = isUnique;
