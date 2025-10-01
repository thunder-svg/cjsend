import { getProfile } from '../utils';

const ProfileSummary = ({ summonerId }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile(summonerId);
      setProfile(data);
    };
    fetchProfile();
  }, [summonerId]);

  return (
    <div className="profile-summary">
      {profile ? (
        <div>
          <h3>{profile.name}</h3>
          <p>Level: {profile.level}</p>
          <p>Rank: {profile.rank}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ProfileSummary;
