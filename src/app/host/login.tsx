import { useMutation } from '@tanstack/react-query';
import { Href, Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { useAuth } from '@/api/auth-context';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { colors, spacing } from '@/theme/theme';

export default function HostLogin() {
  const { status, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => signIn({ email, password }),
  });

  if (status === 'loading') {
    return <Screen />;
  }

  // Sessão válida (persistida ou recém-criada): direto para os eventos
  if (status === 'signedIn') {
    return <Redirect href={'/host/events' as Href} />;
  }

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;
  const fieldErrors = apiError?.errors ?? {};
  const generalMessage =
    mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null;

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Login do host</Text>
        <Input
          label="E-mail"
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
        />
        <Input
          label="Senha"
          placeholder="Sua senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
        />
        {generalMessage ? (
          <Text variant="caption" style={styles.errorMessage}>
            {generalMessage}
          </Text>
        ) : null}
        <Button
          title={mutation.isPending ? 'Entrando…' : 'Entrar'}
          disabled={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorMessage: {
    color: colors.error,
  },
});
