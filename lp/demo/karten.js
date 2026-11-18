// Karten: dieselbe Stelle in vier fertigen Stilen (Rasterkacheln der Stile); Lage und Zoom bleiben beim Umschalten.
window.mxDemo = (c) => {
  c.makeMap([47.27, 11.4], 12, 'streets'); // Innsbruck
  const names = { streets: c.t('Tag', 'Day'), 'streets-night': c.t('Nacht', 'Night'), satellite: c.t('Luftbild', 'Aerial'), outdoors: c.t('Gelände', 'Terrain') };
  c.toggles(Object.entries(names), 'streets', (s) => { c.setStyle(s); c.say(c.t(`Stil „${names[s]}“ (${s})`, `Style “${names[s]}” (${s})`)); });
  c.say(c.t('Stil „Tag“ (streets). Oben umschalten.', 'Style “Day” (streets). Switch above.'));
};
