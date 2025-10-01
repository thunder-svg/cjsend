import { getMetaAnalysis } from '../utils';

const ChampionMeta = () => {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      const data = await getMetaAnalysis();
      setMeta(data);
    };
    fetchMeta();
  }, []);

  return (
    <div className="champion-meta">
      {meta ? (
        <div>
          <h3>Top Picked Champions</h3>
          <ul>
            {meta.topPicks.map((champion) => (
              <li key={champion.id}>{champion.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ChampionMeta;
