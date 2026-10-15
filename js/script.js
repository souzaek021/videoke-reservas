const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    });
  });
}

const dateInput = document.querySelector("#event-date");
const nameInput = document.querySelector("#client-name");
const locationInput = document.querySelector("#event-location");
const checkButton = document.querySelector("#check-availability");
const requestButton = document.querySelector("#request-booking");
const resultBox = document.querySelector("#availability-result");
const availabilityForm = document.querySelector("#availability-form");

let availableDate = "";
let availableLocation = "";

function getSupabaseClient() {
  const config = window.VIDEOKE_CONFIG;

  if (
    !config ||
    !config.supabaseUrl ||
    !config.supabaseAnonKey ||
    config.supabaseUrl.includes("COLE_AQUI") ||
    config.supabaseAnonKey.includes("COLE_AQUI")
  ) {
    return null;
  }

  if (!window.supabase) return null;

  return window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );
}

const db = getSupabaseClient();

function showResult(message, type = "info") {
  if (!resultBox) return;

  resultBox.textContent = message;
  resultBox.className = `availability-result is-visible is-${type}`;
}

function resetAvailability() {
  availableDate = "";
  availableLocation = "";

  if (requestButton) requestButton.disabled = true;
}

if (dateInput) {
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];

  dateInput.min = localToday;
  dateInput.addEventListener("change", resetAvailability);
}

if (nameInput) {
  nameInput.addEventListener("input", resetAvailability);
}

if (locationInput) {
  locationInput.addEventListener("input", resetAvailability);
}

if (checkButton) {
  checkButton.addEventListener("click", async () => {
    if (!dateInput.value || !locationInput.value.trim()) {
      showResult("Informe a data e o local do evento para consultar.", "error");
      return;
    }

    if (dateInput.value < dateInput.min) {
      showResult("Escolha uma data a partir de hoje.", "error");
      return;
    }

    if (!db) {
      showResult(
        "O sistema ainda precisa ser conectado ao Supabase. Siga o arquivo README para configurar o banco de dados.",
        "error"
      );
      return;
    }

    checkButton.disabled = true;
    checkButton.textContent = "Consultando...";
    resetAvailability();

    try {
      const { data, error } = await db.rpc("consultar_disponibilidade", {
        p_data: dateInput.value
      });

      if (error) throw error;

      if (data === false) {
        showResult(
          "Esta data já está ocupada ou aguardando confirmação. Escolha outro dia ou fale conosco pelo WhatsApp.",
          "error"
        );
        return;
      }

      if (data !== true) {
        throw new Error("Resposta inesperada ao consultar disponibilidade.");
      }

      availableDate = dateInput.value;
      availableLocation = locationInput.value.trim();

      requestButton.disabled = false;

      showResult(
        "Boa notícia! A data aparece como disponível. Você pode solicitar a reserva por R$ 300,00 a diária. Ela só será confirmada após a aprovação do locador.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showResult(
        "Não foi possível consultar agora. Verifique a configuração do sistema e tente novamente.",
        "error"
      );
    } finally {
      checkButton.disabled = false;
      checkButton.innerHTML = 'Verificar disponibilidade <span>⌕</span>';
    }
  });
}

if (availabilityForm) {
  availabilityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!availabilityForm.reportValidity()) return;

    if (!db) {
      showResult(
        "O sistema ainda precisa ser conectado ao Supabase. Siga o arquivo README para configurar o banco de dados.",
        "error"
      );
      return;
    }

    if (
      !availableDate ||
      availableDate !== dateInput.value ||
      availableLocation !== locationInput.value.trim()
    ) {
      showResult(
        "Consulte novamente a disponibilidade antes de solicitar a reserva.",
        "error"
      );
      return;
    }

    requestButton.disabled = true;
    requestButton.textContent = "Enviando solicitação...";

    try {
      const payload = {
        nome_cliente: nameInput.value.trim(),
        data_evento: availableDate,
        local_evento: availableLocation,
        status: "pendente",
        valor_diaria: 300
      };

      const { error } = await db.from("reservas").insert(payload);

      if (error) {
        if (error.code === "23505") {
          showResult(
            "Alguém acabou de solicitar ou confirmar essa data. Consulte outro dia, por favor.",
            "error"
          );
        } else {
          throw error;
        }

        resetAvailability();
        return;
      }

      const dateParts = availableDate.split("-");
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      const message = [
        "Olá, Gabriel! Recebi uma solicitação de reserva pelo site VIDEOKE.",
        "",
        `Nome: ${payload.nome_cliente}`,
        `Data do evento: ${formattedDate}`,
        `Local: ${payload.local_evento}`,
        "Valor informado: R$ 300,00 a diária",
        "Status: aguardando confirmação do locador."
      ].join("\n");

      showResult(
        "Solicitação registrada! A data ficará temporariamente reservada enquanto você aguarda a confirmação do locador. Agora você pode enviar os detalhes pelo WhatsApp.",
        "success"
      );

      const wa = `https://wa.me/5541997884496?text=${encodeURIComponent(message)}`;
      window.open(wa, "_blank", "noopener,noreferrer");

      availableDate = "";
      availableLocation = "";
    } catch (error) {
      console.error(error);

      showResult(
        "Não foi possível registrar a solicitação. Tente novamente ou entre em contato pelo WhatsApp.",
        "error"
      );
    } finally {
      requestButton.disabled = true;
      requestButton.innerHTML = 'Solicitar reserva <span>↗</span>';
    }
  });
}

const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
