const groups=[];
// Related alternatives keep all four choices in the same subject area.
function group(topic,category,rows){
 const facts=rows.trim().split('\n').map(line=>line.split('|').map(s=>s.trim()));
 groups.push({topic,category,facts});
}
group(1,'scientific processes',`
Osmosis|Water moves across a selectively permeable membrane towards a more concentrated solution.
Sublimation|A solid changes directly into vapour.
Refraction|Light changes direction on crossing obliquely between media of different optical densities.
Dispersion|White light separates into its component colours in a prism.
Electromagnetic induction|A changing magnetic flux produces an electromotive force.
Transpiration|Water vapour leaves a plant mainly through stomata.
Neutralisation|An acid reacts with a base to form salt and water.
Sedimentation|Suspended particles settle under gravity.
Diffusion|Particles spread down a concentration gradient through random motion.
Condensation|Water droplets form when moist air cools below its dew point.
`);
group(2,'geographical features',`
Orographic rainfall|Air rises against a mountain slope, cools and releases precipitation.
Rain shadow|A leeward region receives relatively little precipitation.
Meander|A river develops a winding bend on a gentle gradient.
Delta|Sediment accumulates where a river enters a relatively still body of water.
Estuary|Fresh water mixes with seawater in a tidal river mouth.
Watershed divide|A ridge separates drainage into different river basins.
Alluvial plain|River-borne sediment builds a broad lowland.
Laterite soil|Intense leaching under hot, wet conditions concentrates iron and aluminium.
Black soil|Clay-rich regur retains moisture and develops deep cracks on drying.
`);
group(3,'social science concepts',`
Demographic dividend|A growing working-age share can support faster economic growth.
Urbanisation|An increasing share of the population lives in towns and cities.
Social mobility|A person changes position in the social hierarchy.
Disguised unemployment|Removing some workers leaves the total output virtually unchanged.
Seasonal unemployment|Workers lack work during a predictable part of the year.
Opportunity cost|Choosing an option entails giving up the next best alternative.
Public good|One person's consumption does not reduce another's, and exclusion is difficult.
Literacy rate|The share of people aged seven or older who can read and write with understanding is measured in the Indian Census.
`);
group(4,'movements and associations',`
Brahmo Samaj|Raja Rammohan Roy helped establish this reform organisation in Bengal.
Satyashodhak Samaj|Jyotirao Phule founded this association to challenge caste hierarchy.
Arya Samaj|Dayananda Saraswati founded this movement advocating a return to the Vedas.
Self-Respect Movement|E. V. Ramasamy promoted self-respect and opposition to caste privilege.
Vaikom Satyagraha|Campaigners sought access to roads around a temple in Travancore.
Mahad Satyagraha|B. R. Ambedkar led a struggle for access to a public water tank.
Chipko movement|Villagers protected Himalayan trees by embracing them.
Swadeshi movement|Opposition to the partition of Bengal encouraged the use of indigenous goods.
`);
group(5,'historical associations',`
Aihole inscription of Pulakeshin II|Ravikirti composed a royal eulogy of a Badami Chalukya ruler.
Talagunda inscription|An inscription recounts the origins of the Kadamba dynasty.
Hampi|The ruins of an imperial capital stand on the Tungabhadra.
Srirangapatna|Tipu Sultan died defending this fortified capital in 1799.
Dandi March|Gandhi challenged the salt laws in 1930.
Quit India resolution|The Congress called for an end to British rule in August 1942.
Battle of Plassey|The East India Company defeated Siraj ud-Daulah in 1757.
Permanent Settlement|A revenue arrangement with zamindars was introduced in Bengal in 1793.
Ashoka's major rock edict XIII|A Mauryan ruler expressed remorse over the Kalinga war.
Kittur uprising|Chennamma resisted British intervention in succession in 1824.
Government of India Act 1935|The legislation provided for provincial autonomy.
`);
group(6,'constitutional provisions',`
Article 14|Equality before the law and equal protection of the laws.
Article 17|Abolition of untouchability.
Article 21A|Free and compulsory education for children aged six to fourteen.
Article 32|Constitutional remedies before the Supreme Court for enforcement of fundamental rights.
Article 40|A directive to organise village panchayats.
Article 51A|Fundamental duties of citizens.
Article 148|The office of the Comptroller and Auditor-General of India.
Article 280|The Finance Commission of India.
Article 324|Superintendence, direction and control of elections vested in the Election Commission.
Article 356|Provisions concerning failure of constitutional machinery in a state.
Article 368|Parliament's power to amend the Constitution and the procedure for doing so.
Article 226|Power of High Courts to issue writs.
Article 315|Public Service Commissions for the Union and the states.
`);
group(8,'Karnataka cultural heritage',`
Yakshagana|A coastal theatre tradition combines dance, dialogue, costume and music.
Dollu Kunitha|A vigorous group dance features large drums strapped to performers.
Channapatna craft|Turned wooden toys are traditionally finished with coloured lacquer.
Bidriware|Silver inlay decorates a blackened metal surface.
Ilkal textiles|A Karnataka weaving tradition interlocks the sari body and pallu in the tope teni technique.
Belur|The Chennakeshava temple exemplifies Hoysala sculpture and architecture.
Pattadakal|A Chalukyan temple complex brings together northern and southern architectural forms.
Vachana literature|Basavanna and Akka Mahadevi used a concise Kannada form associated with social and devotional reform.
Gomateshwara at Shravanabelagola|A monumental standing figure represents Bahubali.
`);
group(9,'agrarian reform concepts',`
Tenancy reform|A tenant cultivator receives stronger legal protection against eviction.
Ceiling on holdings|A statutory upper limit applies to the land one family may hold.
Land redistribution|Surplus agricultural land passes to eligible landless households.
Consolidation of holdings|Scattered farm plots are reorganised into fewer contiguous parcels.
Record of rights|A land record identifies holders, cultivation interests and associated rights.
Abolition of intermediaries|A reform removes rent-collecting layers between cultivators and the state.
Occupancy rights|An eligible tenant can be registered as an occupant under Karnataka land reform provisions.
`);
group(10,'Karnataka economic activities',`
Bengaluru software services|Exports rely heavily on skilled labour and digital connectivity.
Kodagu coffee|Plantation output is sensitive to rainfall and shade management.
Ballari iron ore|Mineral extraction supplies an input to the steel industry.
Ramanagara sericulture|Cocoon markets connect silkworm rearers and silk reelers.
Mandya sugarcane|Irrigation supports a water-intensive crop linked to sugar mills.
New Mangalore Port|Maritime infrastructure connects the state with overseas bulk trade.
Dairy cooperatives|Village procurement links small milk producers with processing and urban markets.
Dryland millet cultivation|Drought-tolerant crops help farmers manage rainfall variability.
`);
group(11,'rural institutions and practices',`
Gram Sabha|Registered village electors deliberate on local priorities.
Gram Panchayat|An elected body provides local governance at village level.
Taluk Panchayat|An intermediate elected institution operates between village and district tiers in Karnataka.
Zilla Panchayat|The elected district-level rural body coordinates development functions.
State Finance Commission|A periodic body recommends how resources should be shared with local bodies.
Social audit|Residents publicly verify expenditure and delivery of works.
Self-help group|Members pool small savings and may obtain credit collectively.
Primary agricultural credit society|A village-level cooperative extends agricultural credit to members.
Watershed development|Soil and water conservation measures are coordinated across a drainage area.
`);
group(12,'administrative technologies',`
Bhoomi|Karnataka computerised its rural land records through this initiative.
Khajane|Karnataka uses this system to computerise treasury operations.
GIS mapping|Spatial layers can identify villages outside the service radius of a clinic.
Digital signature|A recipient can verify the signer and detect changes to a signed electronic document.
Direct benefit transfer|An eligible beneficiary receives a payment in a linked account.
Electronic procurement|Digital tendering records bids and supports comparison under declared criteria.
Audit trail|Time-stamped records allow inspectors to reconstruct changes to a government file.
`);
group(13,'environmental issues',`
Habitat fragmentation|A linear project breaks a continuous wildlife habitat into isolated patches.
Eutrophication|Excess nutrients cause algal blooms and depletion of dissolved oxygen in lakes.
Groundwater depletion|Persistent extraction above recharge causes water tables to fall.
Coastal erosion|Waves and currents remove shoreline material faster than it is replenished.
Soil erosion on slopes|Loss of vegetation allows runoff to carry away fertile topsoil.
Human-elephant conflict|Obstructed corridors increase elephant encounters with farms and settlements.
Urban heat island|Built-up neighbourhoods retain more heat than nearby vegetated areas.
Invasive alien species|An introduced plant spreads rapidly and displaces native vegetation.
`);
