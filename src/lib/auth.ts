export type AppUser = {
  username: string;
  password: string;
  name: string;
  role: "ADMINISTRADOR" | "USUARIO";
};

export const USERS: AppUser[] = [
  {
    username: "Luis Miguel",
    password: "Matheito2026",
    name: "Luis Miguel",
    role: "ADMINISTRADOR",
  },
  {
    username: "Cristina",
    password: "0508mac",
    name: "Cristina",
    role: "USUARIO",
  },
  {
    username: "rrhh",
    password: "rrhh2026",
    name: "RR.HH.",
    role: "USUARIO",
  },
];

export function validateUser(username: string, password: string) {
  return USERS.find(
    (user) =>
      user.username.toLowerCase().trim() === username.toLowerCase().trim() &&
      user.password === password
  );
}
