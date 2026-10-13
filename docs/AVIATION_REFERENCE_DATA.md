# Aviation lookup data for AREES LOOP

This repository includes two small static **suggestion indexes**, not a ticketing system of record.

## Airports

- `public/data/airports-iata.json`: 9,055 IATA-coded airport records as generated on 2026-10-13.
- Source: [srestre/world-countries-cities-db](https://github.com/srestre/world-countries-cities-db), `airports/airports.csv`, derived from [OurAirports](https://ourairports.com/data/).
- OurAirports releases its community-maintained airport data into the **public domain**, with no guarantee of completeness or accuracy.
- Format: `[IATA code, airport name, municipality, country ISO code]`. Airports can share a code, and a code may change or be retired. Manual airport entry remains enabled.
- Entries are useful for autocomplete, **not proof that a route operates or tickets are available**.

## Airlines

- `public/data/airlines-iata.json`: 984 entries generated on 2026-10-13.
- Sources: [OpenFlights airlines.dat](https://github.com/jpatokal/openflights/blob/master/data/airlines.dat) and [AviationShop airline codes](https://github.com/AviationShop/airline-codes).
- OpenFlights database license: [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/); attribution required. AviationShop is CC0.
- OpenFlights' historical `active` flag is not a reliable guarantee of present operations; some 2-character airline codes are reassigned. We overrode a few obvious codes after verification, including `3T` Tarco Aviation and `J4` Badr Airlines. Operators must **verify the currently operating carrier and IATA code before issuing price quotes**.
- Manual airline-name entry is supported because the list is not an official, continuously maintained IATA code register.

## Operational safeguards

- All requests are non-payment inquiries.
- Price offers remain subject to manual verification of aircraft/vessel, seat availability, fare validity and carrier terms.
- Never infer flights or sailings are available from the index alone.
- The official IATA code directory should be treated as authoritative if AREES later obtains licensed access.
