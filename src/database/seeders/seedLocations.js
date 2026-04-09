const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
const PQueue = require('p-queue').default;

const { Region, Subregion, Country, State, City } = require('../../models/locations');

// Helper to convert _id for Number strings
function convertId(doc) {
    if (typeof doc._id === 'string' && !isNaN(Number(doc._id))) {
        doc._id = Number(doc._id);
    }
    return doc;
}

/**
 * Seed Regions (small file, read normally)
 */
const seedRegions = async () => {
    try {
        const filePath = path.join(__dirname, '../../../public/locations-database/regions.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const regions = JSON.parse(data);

        for (const region of regions) {
            const existing = await Region.findById(region._id);
            if (!existing) {
                await Region.create(region);
                console.log(`Created region: ${region.name}`);
            } else {
                console.log(`Region already exists: ${region.name} — skipping`);
            }
        }
        return true;
    } catch (error) {
        console.error('Error seeding regions:', error);
        throw error;
    }
};

/**
 * Seed Subregions (small file, read normally)
 */
const seedSubRegions = async () => {
    try {
        const filePath = path.join(__dirname, '../../../public/locations-database/subregions.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const rawSubRegions = JSON.parse(data);

        const subRegions = rawSubRegions.map((sub) => {
            if (sub._id && sub._id.$oid) {
                sub._id = new mongoose.Types.ObjectId(sub._id.$oid);
            }
            return sub;
        });

        for (const sub of subRegions) {
            const existing = await Subregion.findById(sub._id);
            if (!existing) {
                await Subregion.create(sub);
                console.log(`Created subregion: ${sub.name}`);
            } else {
                console.log(`Subregion already exists: ${sub.name} — skipping`);
            }
        }
        return true;
    } catch (error) {
        console.error('Error seeding subregions:', error);
        throw error;
    }
};

/**
 * Seed Countries (small file, read normally)
 */
const seedCountries = async () => {
    try {
        const filePath = path.join(__dirname, '../../../public/locations-database/countries.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const rawCountries = JSON.parse(data);

        const countries = rawCountries.map(convertId);

        for (const country of countries) {
            const existing = await Country.findById(country._id);
            if (!existing) {
                await Country.create(country);
                console.log(`Created country: ${country.name}`);
            } else {
                console.log(`Country already exists: ${country.name} — skipping`);
            }
        }
        return true;
    } catch (error) {
        console.error('Error seeding countries:', error);
        throw error;
    }
};

/**
 * Seed States using streaming due to large data size
 */
const seedStates = async () => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../../../public/locations-database/states.json');

        const pipeline = chain([
            fs.createReadStream(filePath),
            parser(),
            streamArray()
        ]);

        // Limit concurrency to avoid overwhelming DB (adjust concurrency as needed)
        const queue = new PQueue({ concurrency: 5 });

        pipeline.on('data', ({ value: state }) => {
            queue.add(async () => {
                try {
                state = convertId(state);

                if (!state.location || !state.location.coordinates) {
                    state.location = {
                        type: 'Point',
                        coordinates: [parseFloat(state.longitude), parseFloat(state.latitude)],
                    };
                }

                const existing = await State.findById(state._id);
                if (!existing) {
                    await State.create(state);
                    console.log(`Created state: ${state.name}`);
                } else {
                    console.log(`State already exists: ${state.name} — skipping`);
                }
                } catch (err) {
                    console.error('Error inserting state:', state.name, err);
                }
            });
        });

        pipeline.on('end', async () => {
            try {
                await queue.onIdle();
                console.log('Finished seeding states.');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });

        pipeline.on('error', (err) => {
            console.error('Error reading states JSON file:', err);
            reject(err);
        });
    });
};

/**
 * Seed Cities using streaming due to large data size
 */
const seedCities = async () => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../../../public/locations-database/cities.json');

        const pipeline = chain([
            fs.createReadStream(filePath),
            parser(),
            streamArray()
        ]);

        // Limit concurrency to avoid overwhelming DB (adjust concurrency as needed)
        const queue = new PQueue({ concurrency: 5 });

        pipeline.on('data', ({ value: city }) => {
            queue.add(async () => {
                try {
                    city = convertId(city);

                    if (!city.location || !city.location.coordinates) {
                        city.location = {
                            type: 'Point',
                            coordinates: [parseFloat(city.longitude), parseFloat(city.latitude)],
                        };
                    }

                    const existing = await City.findById(city._id);
                    if (!existing) {
                        await City.create(city);
                        console.log(`Created city: ${city.name}`);
                    } else {
                        console.log(`City already exists: ${city.name} — skipping`);
                    }
                } catch (err) {
                    console.error('Error inserting city:', city.name, err);
                }
            });
        });

        pipeline.on('end', async () => {
            try {
                await queue.onIdle();
                console.log('Finished seeding cities.');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });

        pipeline.on('error', (err) => {
            console.error('Error reading cities JSON file:', err);
            reject(err);
        });
    });
};

module.exports = {
    seedRegions,
    seedSubRegions,
    seedCountries,
    seedStates,
    seedCities,
};
