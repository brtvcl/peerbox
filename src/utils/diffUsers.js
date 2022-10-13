function diffUsers(prev, next) {
	let inserted = [];
	let deleted = [];

	let prevIds = new Set(prev.map(d => d.id));
	let nextIds = new Set(next.map(d => d.id));

	prev.forEach(p => {
		if (!nextIds.has(p.id)) {
			deleted.push(p);
		}
	});

	next.forEach(n => {
		if (!prevIds.has(n.id)) {
			inserted.push(n);
		}
	});

	return [inserted, deleted];
};

export default diffUsers;