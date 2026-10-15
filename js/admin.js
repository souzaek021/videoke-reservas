const config = window.VIDEOKE_CONFIG;
const configured = config && config.supabaseUrl && config.supabaseAnonKey &&
  !config.supabaseUrl.includes("COLE_AQUI") && !config.supabaseAnonKey.includes("COLE_AQUI");
const client = configured && window.supabase
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

const loginPanel = document.querySelector("#login-panel");
const dashboardPanel = document.querySelector("#dashboard-panel");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const dashboardMessage = document.querySelector("#dashboard-message");
const bookingList = document.querySelector("#booking-list");
const signOutButton = document.querySelector("#sign-out");

function setMessage(element, text) {
  element.textContent = text;
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function statusLabel(status) {
  return status === "confirmada" ? "Confirmada" :
    status === "cancelada" ? "Cancelada" : "Pendente";
}

function showLoggedIn(isLoggedIn) {
  loginPanel.hidden = isLoggedIn;
  dashboardPanel.hidden = !isLoggedIn;
  signOutButton.hidden = !isLoggedIn;
}

async function loadBookings() {
  if (!client) return;
  setMessage(dashboardMessage, "Carregando reservas...");
  const { data, error } = await client
    .from("reservas")
    .select("id,nome_cliente,data_evento,local_evento,status,valor_diaria,created_at")
    .order("data_evento", { ascending: true });

  if (error) {
    setMessage(dashboardMessage, "Não foi possível carregar. Confira as políticas de segurança e se sua conta tem permissão de administrador.");
    console.error(error);
    return;
  }

  bookingList.replaceChildren();
  if (!data || data.length === 0) {
    setMessage(dashboardMessage, "Ainda não existem solicitações.");
    return;
  }
  setMessage(dashboardMessage, `${data.length} registro(s) encontrado(s).`);

  data.forEach((booking) => {
    const item = document.createElement("article");
    item.className = "booking-item";

    const info = document.createElement("div");
    const status = document.createElement("span");
    status.className = `booking-status ${booking.status === "confirmada" ? "confirmed" : booking.status === "cancelada" ? "cancelled" : ""}`;
    status.textContent = statusLabel(booking.status);

    const title = document.createElement("h3");
    title.textContent = booking.nome_cliente;

    const date = document.createElement("p");
    date.textContent = `Data: ${formatDate(booking.data_evento)} · R$ ${Number(booking.valor_diaria).toFixed(2).replace(".", ",")}`;

    const location = document.createElement("p");
    location.textContent = `Local: ${booking.local_evento}`;

    info.append(status, title, date, location);
    item.append(info);

    const actions = document.createElement("div");
    actions.className = "booking-actions";

    if (booking.status === "pendente") {
      const confirm = document.createElement("button");
      confirm.className = "button button-primary";
      confirm.textContent = "Confirmar";
      confirm.addEventListener("click", () => updateStatus(booking.id, "confirmada"));
      actions.append(confirm);
    }

    if (booking.status !== "cancelada") {
      const cancel = document.createElement("button");
      cancel.className = "button button-ghost";
      cancel.textContent = "Cancelar";
      cancel.addEventListener("click", () => updateStatus(booking.id, "cancelada"));
      actions.append(cancel);
    }

    item.append(actions);
    bookingList.append(item);
  });
}

async function updateStatus(id, status) {
  if (!client) return;
  const { error } = await client.from("reservas").update({ status }).eq("id", id);
  if (error) {
    setMessage(dashboardMessage, "Não foi possível atualizar. Confira as permissões do banco.");
    console.error(error);
    return;
  }
  await loadBookings();
}

if (!client) {
  setMessage(loginMessage, "Configure a URL e a chave pública do Supabase em js/config.js antes de usar o painel.");
  loginForm.querySelector("button").disabled = true;
}

if (loginForm && client) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "Entrando...");
    const { error } = await client.auth.signInWithPassword({
      email: document.querySelector("#login-email").value.trim(),
      password: document.querySelector("#login-password").value
    });
    if (error) {
      setMessage(loginMessage, "Não foi possível entrar. Confira e-mail e senha.");
      return;
    }
    showLoggedIn(true);
    await loadBookings();
  });
}

if (signOutButton && client) {
  signOutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    showLoggedIn(false);
  });
}

document.querySelector("#refresh-bookings")?.addEventListener("click", loadBookings);

if (client) {
  client.auth.getSession().then(async ({ data }) => {
    if (data.session) {
      showLoggedIn(true);
      await loadBookings();
    } else {
      showLoggedIn(false);
    }
  });
}
