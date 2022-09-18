//@ts-nocheck
import { auth, SignInWithGoogle, logout, db } from "../../firebase";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  query,
  collection,
  where,
  Firestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { SetStateAction, useEffect, useState } from "react";
import useWindowDimensions from "../WindowDimensions/useWindowDimensions";
import { ArrowAutofitRight, Books, Plus } from "tabler-icons-react";

import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Grid, GridItem } from "@chakra-ui/react";
import { Center, Square, Circle } from "@chakra-ui/react";
import { Stack, HStack, VStack } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../../ColorModeSwitcher";
import { IconButton } from "@chakra-ui/react";
import { Logout } from "tabler-icons-react";
import { Container } from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  AddIcon,
  ExternalLinkIcon,
  RepeatIcon,
  EditIcon,
} from "@chakra-ui/icons";

import { FirebaseError } from "firebase/app";
import { updateDoc, serverTimestamp } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { EMLINK } from "constants";

const googleSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="24px"
    height="24px"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

export function Home() {
  const { height, width } = useWindowDimensions();

  const [loggedin, setLoggedin] = useState<boolean>(false);
  const [welcomeText, setWelcomeText] = useState<string>("Hello!");

  const [todayInputValue, setTodayInputValue] = useState<string>("");
  const handleTodayInputValueChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setTodayInputValue(event.target.value);

  const [uid, setUid] = useState("");

  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedin(true);
      } else {
        setLoggedin(false);
      }
    });
  }, []);

  const [Todos, setTodos] = useState([]);

  useEffect(() => {
    if (loggedin == true) {
      const colRef = collection(db, auth.currentUser?.uid);
      onSnapshot(colRef, (snapshot) => {
        setTodos(snapshot.docs.map((doc) => doc.data()));
      });
    }
  }, [loggedin]);

  const writeTodo = async () => {
    const db2 = getDatabase();
    await setDoc(doc(db, auth.currentUser?.uid, todayInputValue), {
      created_by: auth.currentUser?.uid,
      todo: todayInputValue,
      created_at: serverTimestamp(),
    });
  };

  return (
    <>
      <Center h={height} w={width}>
        <VStack>
          <HStack>
            <Text fontSize="3xl" as="b">
              {welcomeText}
            </Text>
            <ColorModeSwitcher />
            {loggedin ? (
              <IconButton
                onClick={logout}
                aria-label={"Log out"}
                icon={<Logout />}
              >
                Logout
              </IconButton>
            ) : null}
          </HStack>
          {!loggedin ? (
            <Button
              leftIcon={googleSVG}
              onClick={() => {
                SignInWithGoogle();
              }}
              variant="solid"
              colorScheme={"gray"}
              borderRadius={50}
            >
              Sign in with Google
            </Button>
          ) : null}
          {loggedin ? (
            <>
              <Container>
                <Text as="b">Today</Text>
                <HStack>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<Plus color={"gray"} />}
                    />
                    <Input
                      value={todayInputValue}
                      onChange={handleTodayInputValueChange}
                      placeholder="To Do"
                      colorScheme={"blue"}
                      variant="outline"
                    ></Input>
                  </InputGroup>
                  <Button
                    onClick={() => {
                      writeTodo();
                      setTodayInputValue("");
                    }}
                  >
                    <Text>Add Todo</Text>
                  </Button>
                </HStack>
              </Container>
            </>
          ) : null}
          <Container maxHeight={200} height={50}>
            {loggedin
              ? Todos.map((element, index) => {
                  return (
                    <>
                      {index > 0 && <Divider />}
                      <Flex
                        key={index}
                        w="100%"
                        p={3}
                        my={1}
                        align="center"
                        borderRadius={5}
                        justifyContent="space-between"
                      >
                        <Text fontSize={"xl"} mr={4} key={index} as="b">
                          {index + 1}.
                        </Text>
                        <Text key={index}>{element.todo}</Text>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<HamburgerIcon />}
                            variant="outline"
                          />
                          <MenuList>
                            <MenuItem icon={<AddIcon />} command="⌘T">
                              New Tab
                            </MenuItem>
                            <MenuItem icon={<ExternalLinkIcon />} command="⌘N">
                              New Window
                            </MenuItem>
                            <MenuItem icon={<RepeatIcon />} command="⌘⇧N">
                              Open Closed Tab
                            </MenuItem>
                            <MenuItem icon={<EditIcon />} command="⌘O">
                              Open File...
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </>
                  );
                })
              : null}
          </Container>
        </VStack>
      </Center>
    </>
  );
}
