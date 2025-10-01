import { getMatches } from '../utils';

const MatchHistory = ({ summonerId }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const data = await getMatches(summonerId);
      setMatches(data.matches);
    };
    fetchMatches();
  }, [summonerId]);

  return (
    <div className="match-history">
      {matches.length > 0 ? (
        <ul>
          {matches.map((match) => (
            <li key={match.id}>{match.champion} - {match.kda}</li>
          ))}
        </ul>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default MatchHistory;
