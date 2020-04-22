const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// Loop through removeFields & Delete from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create new query string
	let queryStr = JSON.stringify(reqQuery);

	// Create seatch operators ($gt, $lt etc.)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = model.find(JSON.parse(queryStr));

	// Select Fields
	if (req.query.select) {
		// const fields = req.query.select.split(',').join(' ');
		const fields = req.query.select.replace(/,/g, ' ');
		query = query.select(fields);
	}

	// Sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.replace(/,/g, ' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// Pagination & Limiting
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 20;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	// Populating the query dynamically
	if (populate) {
		query = query.populate(populate);
	}

	// Exec query
	const results = await query;

	// Pagination Results
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
