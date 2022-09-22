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
  deleteDoc,
} from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { SetStateAction, useEffect, useState } from "react";
import useWindowDimensions from "../WindowDimensions/useWindowDimensions";
import { ArrowAutofitRight, Books, Check, Plus } from "tabler-icons-react";

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
  DeleteIcon,
  CloseIcon,
  CheckIcon,
} from "@chakra-ui/icons";

import {
  Editable,
  EditableInput,
  EditableTextarea,
  EditablePreview,
  useEditableControls,
} from "@chakra-ui/react";

import { FirebaseError } from "firebase/app";
import { updateDoc, serverTimestamp } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { EMLINK } from "constants";
import { useRef } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaTasks } from "react-icons/fa";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

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

  const [todoValue, setTodoValue] = useState("");

  const [currElement, setCurrElement] = useState(null);
  const [currIndex, setCurrIndex] = useState(0);

  const taskRef = useRef(null);
  const todoRef = useRef(null);

  const [todayTaskInputValue, setTodayTaskInputValue] = useState("");
  const handleTodayTaskInputValueChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setTodayTaskInputValue(event.target.value);

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
    await addDoc(collection(db, auth.currentUser?.uid), {
      created_by: auth.currentUser?.uid,
      todo: todayInputValue,
      created_at: serverTimestamp(),
      tasks: [],
      completed: false,
    });
  };

  const deleteTodo = async (element, index) => {
    const q = query(
      collection(db, auth.currentUser?.uid),
      where("todo", "==", element.todo)
    );
    const aux = await getDocs(q);
    const log = aux.docs[0];
    const uid = log.id;
    await deleteDoc(doc(db, auth.currentUser?.uid, uid));
  };

  const editTodo = async (element, index, todoValue) => {
    const q = query(
      collection(db, auth.currentUser?.uid),
      where("todo", "==", element.todo)
    );
    const aux = await getDocs(q);
    const log = aux.docs[0];
    const uid = log.id;
    await updateDoc(doc(db, auth.currentUser?.uid, uid), {
      todo: todoValue,
    });
  };

  const addTask = async (element, index, taskValue) => {
    const q = query(
      collection(db, auth.currentUser?.uid),
      where("todo", "==", element.todo)
    );
    const aux = await getDocs(q);
    const log = aux.docs[0];
    const uid = log.id;
    const task = {
      task: taskValue,
      completed: false,
    };
    await updateDoc(
      doc(db, auth.currentUser?.uid, uid),
      {
        tasks: [...log.data().tasks, task],
      },
      { merge: true }
    );
    setTodayTaskInputValue("");
  };

  const updateTask = async (element, task, index) => {
    const q = query(
      collection(db, auth.currentUser?.uid),
      where("todo", "==", element.todo)
    );
    const aux = await getDocs(q);
    const log = aux.docs[0];
    const uid = log.id;
    let tasks = log.data().tasks;
    tasks[index].completed = !tasks[index].completed;
    let shouldDelete = true;
    tasks.forEach((element) => {
      if (element.completed == false) {
        shouldDelete = false;
      }
    });
    if (shouldDelete) {
      deleteTodo(element, index);
    }
    await updateDoc(
      doc(db, auth.currentUser?.uid, uid),
      {
        tasks: tasks,
      },
      { merge: true }
    );
  };

  function EditableControls(element, index) {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup size="sm">
        <IconButton
          icon={<CheckIcon />}
          {...(getSubmitButtonProps(), editTodo(element, index))}
        />
        <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
      <IconButton
        size="md"
        variant={"outline"}
        icon={<EditIcon />}
        {...getEditButtonProps()}
      />
    );
  }

  function CustomControlsExample() {
    /* Here's a custom control */

    return (
      <Editable
        textAlign="center"
        defaultValue="Rasengan ⚡️"
        isPreviewFocusable={false}
      >
        <EditablePreview />
        {/* Here is the custom input */}
        <Input as={EditableInput} />
        <EditableControls />
      </Editable>
    );
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleClick = (element, index) => {
    setCurrElement(element);
    setCurrIndex(index);
    onOpen();
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
                style={{ borderRadius: "30%" }}
                colorScheme="teal"
                variant="ghost"
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
                      autoFocus={true}
                      value={todayInputValue}
                      onChange={handleTodayInputValueChange}
                      placeholder="To Do"
                      colorScheme={"teal"}
                      variant="filled"
                      focusBorderColor={"teal.500"}
                    ></Input>
                  </InputGroup>
                  <Button
                    style={{ borderRadius: "20px", padding: "20px" }}
                    colorScheme="teal"
                    onClick={() =>
                      todayInputValue != ""
                        ? (writeTodo(), setTodayInputValue(""))
                        : null
                    }
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
                      {index > 0 && <Divider key={index} />}
                      <Flex
                        key={index}
                        w="100%"
                        p={3}
                        my={1}
                        borderRadius={3}
                        justifyContent="space-between"
                        align="center"
                      >
                        <Text fontSize={"xl"} mr={4} key={index} as="b">
                          {index + 1}.
                        </Text>
                        {element.tasks.length == 0 ? (
                          <Checkbox
                            colorScheme={"teal"}
                            size="lg"
                            onChange={() => {
                              deleteTodo(element, index);
                            }}
                          >
                            <Text as="b">{element.todo}</Text>
                          </Checkbox>
                        ) : (
                          <Text key={index} fontSize={"lg"} as="b">
                            {element.todo}
                          </Text>
                        )}

                        <Menu key={index}>
                          <MenuButton
                            key={index}
                            as={IconButton}
                            aria-label="Options"
                            icon={<HamburgerIcon />}
                            style={{ borderRadius: "30%" }}
                            colorScheme="teal"
                          />
                          <MenuList key={index}>
                            <MenuItem
                              key={index}
                              onClick={() => {
                                handleClick(element, index);
                              }}
                              icon={<AddIcon />}
                              command="⌘T"
                            >
                              New Task
                            </MenuItem>
                            <MenuItem
                              key={index}
                              onClick={() => {
                                deleteTodo(element, index);
                              }}
                              icon={<DeleteIcon />}
                              command="⌘DEL"
                            >
                              Delete Todo
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                      <Center>
                        <VStack>
                          {element.tasks.map((task, index) => {
                            return (
                              <>
                                <Checkbox
                                  key={index}
                                  size="lg"
                                  colorScheme={"teal"}
                                  checked={task.completed}
                                  defaultChecked={task.completed}
                                  onChange={() => {
                                    updateTask(element, task, index);
                                  }}
                                >
                                  {task.task}
                                </Checkbox>
                              </>
                            );
                          })}
                        </VStack>
                      </Center>
                    </>
                  );
                })
              : null}
            <>
              <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={taskRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
              >
                <AlertDialogOverlay />

                <AlertDialogContent borderRadius={"20px"}>
                  <AlertDialogHeader>Create New Task</AlertDialogHeader>
                  <AlertDialogCloseButton />
                  <AlertDialogBody>
                    <Input
                      ref={taskRef}
                      value={todayTaskInputValue}
                      onChange={handleTodayTaskInputValueChange}
                      placeholder="Task"
                      variant={"filled"}
                      borderRadius="50px"
                      focusBorderColor={"teal.500"}
                    />
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button
                      ref={cancelRef}
                      onClick={onClose}
                      borderRadius="50px"
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="teal"
                      ml={3}
                      borderRadius={"50px"}
                      onClick={() => {
                        addTask(currElement, currIndex, todayTaskInputValue);
                        onClose();
                      }}
                    >
                      Add
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          </Container>
        </VStack>
      </Center>
    </>
  );
}
