import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

type Usuario = {
  uid: string;
  email: string | null;
};

export async function criarUsuario(params: Usuario & { nome?: string }) {
  const { uid, email, nome } = params;

  const data: Record<string, unknown> = {
    uid,
    email,
    atualizadoEm: serverTimestamp(),
    criadoEm: serverTimestamp(),
  };

  if (nome) {
    data.nome = nome;
  }

  await setDoc(doc(db, "usuarios", uid), data, { merge: true });
}

export async function registrarUltimoLogin(uid: string, email: string | null) {
  await setDoc(
    doc(db, "usuarios", uid),
    {
      uid,
      email,
      ultimoLoginEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function salvarNotaUsuario(
  uid: string,
  valor: string,
  latitude: number | null,
  longitude: number | null,
  endereco: string | null,
) {
  await addDoc(collection(db, "notes"), {
    valor,
    uid,
    latitude,
    longitude,
    endereco,
    createdAt: serverTimestamp(),
  });
}
