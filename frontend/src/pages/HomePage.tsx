import React from 'react';
import Chat from '../components/features/Chat/Chat';
import UserProfile from '../components/common/UserProfile';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* <UserProfile /> */}
      <Chat />
    </div>
  );
};

export default HomePage;
