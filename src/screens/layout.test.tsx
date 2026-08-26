import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => require('react').createElement('Ionicons', props)
}));

// A generic chainable query mock - screens call different combinations of
// .select/.eq/.order/.update/.insert/.delete before awaiting the result, and
// each one just needs to resolve to *something* without throwing so a
// screen's initial render completes. .single() is the one exception: it's
// asking for one record rather than a list, so it gets its own resolved
// shape instead of the list default.
jest.mock('../lib/supabase', () => {
  const makeChain = (): any => {
    const chain: any = {
      then: (resolve: any, reject: any) =>
        Promise.resolve({ data: [], error: null }).then(resolve, reject)
    };
    ['select', 'eq', 'order', 'update', 'insert', 'delete'].forEach(method => {
      chain[method] = jest.fn(() => chain);
    });
    chain.single = jest.fn(() =>
      Promise.resolve({ data: { name: 'n', tags: [] }, error: null })
    );
    return chain;
  };

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(() => Promise.resolve({ data: { user: { email: 'a@b.c' } } }))
      },
      from: jest.fn(() => makeChain())
    },
    currentUserId: jest.fn(() => Promise.resolve('uid'))
  };
});

import SignUpLoginScreen from './Auth/SignUpLoginScreen';
import LoginScreen from './Auth/LoginScreen';
import SignUpScreen from './Auth/SignUpScreen';
import ForgotPasswordScreen from './Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './Auth/ResetPasswordScreen';
import MeScreen from './MeScreen';
import SubmitLogScreen from './SubmitLogScreen';
import ViewLogScreen from './ViewLogScreen';
import HomeScreen from './HomeScreen';
import LogNewSessionScreen from './LogNewSessionScreen';

// Every navigation method a screen under test might call - none of them
// actually navigate anywhere here, they just need to exist so a screen that
// calls navigation.setOptions() (or similar) on mount doesn't throw.
const navigation: any = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  reset: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  setOptions: jest.fn()
};

const log: any = {
  id: 1,
  strain: 'Super Silver Haze',
  type: 'Flower',
  date: '2026-03-26T00:00:00Z',
  finalRating: 5,
  notes: 'notes here',
  tags: ['Ideas', 'Focused'],
  happy: 3,
  creative: 3,
  active: 3,
  relaxed: 3,
  sleepy: 0,
  anxiety: 1,
  migraines: 1,
  depression: 1,
  pain: 1,
  insomnia: 1
};

// Flattens every host node in a rendered tree down to its tag, its text (if
// any), and its resolved style - not the tree of React elements. This is
// what actually gets drawn on screen, so it's what a snapshot should track:
// a style object move, a width change, a color swap all show up as a diff
// here even when nothing about the component tree's shape changed.
const flatten = (node: any, depth = 0, out: string[] = []): string[] => {
  if (node === null || node === undefined || typeof node !== 'object') {
    return out;
  }

  if (Array.isArray(node)) {
    node.forEach(n => flatten(n, depth, out));
    return out;
  }

  if (typeof node.type === 'string') {
    const style = StyleSheet.flatten(node.props ? node.props.style : undefined) || {};
    const styleKeys = Object.keys(style).sort();
    const styleStr = styleKeys.map(k => `${k}:${JSON.stringify((style as any)[k])}`).join(', ');
    const text = typeof node.children?.[0] === 'string' ? ` "${node.children[0]}"` : '';
    out.push(`${'  '.repeat(depth)}<${node.type}${text} {${styleStr}}>`);
  }

  (node.children || []).forEach((c: any) => flatten(c, depth + 1, out));
  return out;
};

// Async act, not the sync version: a few of these screens fire an async IIFE
// inside useEffect (HomeScreen, MeScreen, LogNewSessionScreen all fetch on
// mount). Sync act only flushes synchronous effects, so those promises'
// state updates would otherwise land after the test - and after later tests
// unmount their own renderers - which crashes the process instead of just
// failing the assertion. Async act flushes the microtask queue until it's
// stable, so those updates happen inside this test, not after it.
const renderLayout = async (element: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(element);
  });
  return flatten(tree!.toJSON()).join('\n');
};

test('SignUpLoginScreen layout', async () => {
  expect(
    await renderLayout(<SignUpLoginScreen navigation={navigation} route={{} as any} />)
  ).toMatchSnapshot();
});

test('LoginScreen layout', async () => {
  expect(
    await renderLayout(<LoginScreen navigation={navigation} route={{} as any} />)
  ).toMatchSnapshot();
});

test('SignUpScreen layout', async () => {
  expect(
    await renderLayout(<SignUpScreen navigation={navigation} route={{} as any} />)
  ).toMatchSnapshot();
});

test('ForgotPasswordScreen layout', async () => {
  expect(
    await renderLayout(<ForgotPasswordScreen navigation={navigation} route={{} as any} />)
  ).toMatchSnapshot();
});

test('ResetPasswordScreen layout', async () => {
  expect(await renderLayout(<ResetPasswordScreen onComplete={jest.fn()} />)).toMatchSnapshot();
});

test('MeScreen layout', async () => {
  expect(await renderLayout(<MeScreen />)).toMatchSnapshot();
});

test('SubmitLogScreen layout', async () => {
  expect(
    await renderLayout(
      <SubmitLogScreen navigation={navigation} route={{ params: { log } } as any} />
    )
  ).toMatchSnapshot();
});

test('ViewLogScreen layout', async () => {
  expect(
    await renderLayout(<ViewLogScreen navigation={navigation} route={{ params: { log } } as any} />)
  ).toMatchSnapshot();
});

test('HomeScreen layout', async () => {
  expect(
    await renderLayout(<HomeScreen navigation={navigation} route={{} as any} />)
  ).toMatchSnapshot();
});

test('LogNewSessionScreen layout', async () => {
  expect(
    await renderLayout(
      <LogNewSessionScreen navigation={navigation} route={{ params: { log } } as any} />
    )
  ).toMatchSnapshot();
});
