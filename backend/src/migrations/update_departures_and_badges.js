const { Tour, TourDeparture } = require('../models');

async function updateData() {
    const departures = await TourDeparture.findAll();
    console.log('Total departures:', departures.length);

    for (const dep of departures) {
        const curDate = new Date(dep.departure_date);
        if (curDate < new Date('2026-11-08')) {
            curDate.setMonth(curDate.getMonth() + 7);
            const newDateStr = curDate.toISOString().split('T')[0];
            const oldDate = dep.departure_date;
            await dep.update({ departure_date: newDateStr });
            console.log(`Updated departure ${dep.id} for tour ${dep.tour_id}: ${oldDate} -> ${newDateStr}`);
        }
    }

    const promoTours = await Tour.findAll({ where: { id: [2, 4, 13] } });
    for (const t of promoTours) {
        await t.update({ tour_badge: 'promotion' });
        console.log(`Updated tour ${t.id} (${t.title}) badge to 'promotion'`);
    }

    console.log('Update completed successfully.');
    process.exit(0);
}

updateData().catch(err => {
    console.error('Error updating data:', err);
    process.exit(1);
});

