alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table wa_accounts enable row level security;
alter table wa_numbers enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table ai_settings enable row level security;
alter table interventions enable row level security;
alter table events enable row level security;

create policy "workspaces_select" on workspaces
  for select using (
    id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "workspaces_insert" on workspaces
  for insert with check (auth.uid() = owner_user_id);

create policy "workspaces_update" on workspaces
  for update using (
    id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "workspace_members_select" on workspace_members
  for select using (user_id = auth.uid() or workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  ));

create policy "workspace_members_insert" on workspace_members
  for insert with check (
    workspace_id in (select id from workspaces where owner_user_id = auth.uid())
  );

create policy "wa_accounts_all" on wa_accounts
  for all using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ) with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "wa_numbers_all" on wa_numbers
  for all using (
    wa_account_id in (
      select id from wa_accounts where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  ) with check (
    wa_account_id in (
      select id from wa_accounts where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );

create policy "leads_all" on leads
  for all using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ) with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "conversations_all" on conversations
  for all using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ) with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "messages_all" on messages
  for all using (
    conversation_id in (
      select id from conversations where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  ) with check (
    conversation_id in (
      select id from conversations where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );

create policy "ai_settings_all" on ai_settings
  for all using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ) with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

create policy "interventions_all" on interventions
  for all using (
    conversation_id in (
      select id from conversations where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  ) with check (
    conversation_id in (
      select id from conversations where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );

create policy "events_all" on events
  for all using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ) with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );
