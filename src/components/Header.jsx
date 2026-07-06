import React from 'react';
import { Link } from 'react-router-dom';
import { Show, SignInButton, UserButton } from '@clerk/react';
import LoginButton from './LoginButton';
import { useUser } from '@clerk/react';

const Header = () => {
  const { user } = useUser();

  return (
    <header>
      <Link to="/">
        <div className="logo">
          Eve
          <span>n</span>
          tly
        </div>
      </Link>

      <nav>
        <Link to="/about" className="menu__link">About</Link>
        <Link to="/create" className="menu__link">Create</Link>
        <Link to="/favorites" className="menu__link">Favorites</Link>
        <Link to="/past-events" className="menu__link">Past events</Link>

        {user && (
          <Link to="/user-events" className="menu__link">My events</Link>
        )}
      </nav>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <div>
            <LoginButton />
          </div>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton afterSignOutUrl="/" />
      </Show>
    </header>
  );
};

export default Header;