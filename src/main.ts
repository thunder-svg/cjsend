import ProfileSummary from './components/ProfileSummary';
import MatchHistory from './components/MatchHistory';
import ChampionMeta from './components/ChampionMeta';

const App = () => {
  const summonerId = 'Faker#KR1';  // 예시 소환사 ID

  return (
    <div>
      <ProfileSummary summonerId={summonerId} />
      <MatchHistory summonerId={summonerId} />
      <ChampionMeta />
    </div>
  );
};

export default App;
