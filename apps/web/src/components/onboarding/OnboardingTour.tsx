import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Joyride, EVENTS, STATUS, ACTIONS, type Step, type EventData } from 'react-joyride';
import { useMe, useConcluirOnboarding } from '../../hooks/useApi';

type TourStep = Step & { route?: string };

const steps: TourStep[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Bem-vindo ao ClienteBox!',
    content: 'Vamos te mostrar o essencial em poucos passos.',
  },
  {
    target: '[data-tour="novo-cliente"]',
    route: '/clientes',
    title: 'Cadastre seu primeiro cliente',
    content: 'Clique aqui para adicionar um cliente à sua base.',
  },
  {
    target: '[data-tour="novo-lancamento"]',
    route: '/financeiro',
    title: 'Registre uma venda',
    content: 'Lance receitas e despesas por aqui.',
  },
  {
    target: '[data-tour="dashboard-kpis"]',
    route: '/',
    title: 'Acompanhe pelo Dashboard',
    content: 'Aqui você vê receitas, despesas e sua meta do mês em tempo real.',
  },
];

export function OnboardingTour() {
  const { data: me } = useMe();
  const concluirOnboarding = useConcluirOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (me && !me.onboardingConcluido) {
      setRun(true);
    }
  }, [me]);

  const handleEvent = (data: EventData) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      concluirOnboarding.mutate();
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      const proximoPasso = steps[nextIndex];
      if (proximoPasso?.route && proximoPasso.route !== location.pathname) {
        navigate(proximoPasso.route);
      }
      setStepIndex(nextIndex);
    }
  };

  if (!me || me.onboardingConcluido) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleEvent}
      locale={{ back: 'Voltar', close: 'Fechar', last: 'Concluir', next: 'Próximo', skip: 'Pular' }}
      options={{ primaryColor: '#2563EB', zIndex: 10000, skipBeacon: true, buttons: ['back', 'close', 'primary', 'skip'] }}
    />
  );
}
