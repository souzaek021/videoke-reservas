# VIDEOKE — Site com consulta de disponibilidade e reservas

Projeto responsivo com HTML, CSS e JavaScript, integrado ao Supabase para consultar datas, registrar solicitações e gerenciar reservas.

## O que está incluído

- Site público com preço de R$ 300 por diária, fotos enviadas, detalhes do kit e contato via WhatsApp.
- Consulta de disponibilidade no banco de dados.
- Solicitação de reserva com status `pendente`.
- Uma solicitação pendente ou confirmada bloqueia a data para evitar reservas duplicadas.
- Painel em `admin.html` para o locador entrar, confirmar ou cancelar solicitações.
- As datas canceladas voltam a ficar disponíveis.
- Validação de data mínima no formulário.
- Layout responsivo para PC, tablet e celular.

## Importante: requer configuração antes de funcionar

O ZIP contém o código, mas o banco de dados e a conta do locador precisam ser configurados. Sem isso, o site avisa que ainda falta conectar o Supabase.

### 1. Criar o banco Supabase

1. Acesse https://supabase.com/ e crie um projeto.
2. Dentro do projeto, abra **SQL Editor**.
3. Abra o arquivo `supabase-schema.sql`, copie todo o conteúdo e execute no SQL Editor.
4. No Supabase, abra **Project Settings → API** (ou **Connect**, conforme a interface) e copie a Project URL e a chave pública `anon`/`publishable`.

### 2. Conectar o site

Abra `js/config.js` e substitua os dois valores de exemplo:

```js
window.VIDEOKE_CONFIG = {
  supabaseUrl: "SUA_PROJECT_URL",
  supabaseAnonKey: "SUA_CHAVE_PUBLICA"
};
```

Use somente a chave pública `anon`/`publishable` no navegador. **Nunca coloque a chave `service_role` no HTML ou JavaScript.**

### 3. Criar o acesso do locador

1. No painel do Supabase, abra **Authentication → Users**.
2. Crie um usuário com e-mail e senha para o locador.
3. Copie o UUID/ID desse usuário.
4. Abra **SQL Editor** e execute o comando abaixo, substituindo o UUID pelo ID real:

```sql
insert into public.videoke_admins (user_id)
values ('COLE-AQUI-O-UUID-DO-USUARIO');
```

5. Se não pretende permitir que visitantes criem contas, desative os cadastros públicos em **Authentication → Settings / Sign In** (o nome pode variar na interface).
6. Abra `admin.html` no site hospedado para entrar no painel.

O painel só permite gerenciar reservas para usuários cujo ID está cadastrado em `videoke_admins`. Não compartilhe a conta do locador.

### 4. Publicar o site

Para testar localmente, abra a pasta no VS Code e use uma extensão como Live Server. Também pode publicar os arquivos em hospedagem estática, por exemplo GitHub Pages. O Supabase fica responsável pelos dados.

## Como o fluxo funciona

1. Cliente preenche nome, data e local.
2. Clica em **Verificar disponibilidade**; o site consulta o banco.
3. Se a data estiver livre, pode clicar em **Solicitar reserva**.
4. O banco registra a solicitação como `pendente`, e a data fica bloqueada temporariamente.
5. O locador entra em `admin.html` e confirma ou cancela.
6. Ao cancelar, a data é liberada novamente.

A solicitação pendente é uma retenção temporária da data, mas este projeto ainda não tem expiração automática de solicitações. Se um cliente desistir, cancele a solicitação no painel para liberar a data.

## Contato

O botão de WhatsApp usa o número exibido na arte enviada: `41 99788-4496`. Para alterar, atualize o link no `index.html` e em `js/script.js`.

## Arquivos

- `index.html`: site público.
- `admin.html`: painel do locador.
- `css/style.css`: estilo responsivo.
- `js/config.js`: credenciais públicas de configuração do Supabase.
- `js/script.js`: consulta de datas e criação de solicitações.
- `js/admin.js`: login e gestão das reservas.
- `supabase-schema.sql`: estrutura e políticas do banco.
- `assets/`: imagens fornecidas.
