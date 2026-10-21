export type ShipmentMethod = "Parcel" | "EMS";

export const MIN_WEIGHT = 0.5;
export const MAX_WEIGHT = 31.5;
export const WEIGHT_STEP = 0.5;

const DOMESTIC_RATES: Record<ShipmentMethod, Record<number, number>> = {
  Parcel: { 0.5: 565, 1: 565, 1.5: 565 },
  EMS: { 0.5: 550, 1: 750, 1.5: 845 },
};

export function isSupportedWeight(weight: number): boolean {
  return (
    Number.isFinite(weight) &&
    weight >= MIN_WEIGHT &&
    weight <= MAX_WEIGHT &&
    Number.isInteger(weight / WEIGHT_STEP)
  );
}

export function domesticPostage(
  method: ShipmentMethod,
  country: string,
  weight: number,
): number | null {
  if (country !== "Ethiopia" || !isSupportedWeight(weight)) return null;
  return DOMESTIC_RATES[method][weight] ?? null;
}

// Destination names are informational; no international tariff is inferred.
export const DESTINATIONS = [
  "Ethiopia",
  ...`Afghanistan|Albania|Algeria|Angola|Anguilla|Antigua and Barbuda|Argentina|Armenia|Aruba|Ascension Island|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bermuda|Bhutan|Bolivia|Bosnia & Herzegovina|Botswana|Brazil|Brunei Darussalam|Bulgaria|Burkina Faso|Burundi|Cambodia|Cameroon|Canada|Cape Verde|Cayman Islands|Central African Republic|Chad|Chile|China|China Hong Kong|China Macau|Colombia|Comoros|Congo Brazzaville|Costa Rica|Cote D’Ivoire|Croatia|Cuba|Cyprus|Czech Republic|Democratic Republic of Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Falkland Islands|Fiji|Finland|France|French Polynesia|Gabon|Gambia|Georgia|Germany|Ghana|Gibraltar|Great Britain|Greece|Grenada|Guatemala|Guinea|Guinea Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Korea Dem Peo Rep|Korean Republic|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Lithuania|Luxembourg|Macedonia|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Mauritania|Mauritius|Mexico|Moldova|Mongolia|Montenegro|Montserrat|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Caledonia|New Zealand|Nicaragua|Niger|Nigeria|Norway|Oman|Pakistan|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Pitcairn Island|Poland|Portugal|Qatar|Romania|Russian Federation|Rwanda|Samoa|Sao Tome & Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Sudan|Spain|Sri Lanka|St. Kitts and Nevis|St. Lucia|St. Vincent & Grenadines|St. Helena|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad & Tobago|Tristan Da Cunha|Tunisia|Turkey|Turkmenistan|Turks and Caicos Islands|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom (UK)|United States (US)|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Virgin Islands GB|Yemen|Zambia|Zimbabwe`.split(
    "|",
  ),
];
