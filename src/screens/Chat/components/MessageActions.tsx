import { IDataActionType, IMessage } from '@/models/ModelChat';
import { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '@/components/ui/text';

function MessageActions({ message }: { readonly message: IMessage }) {
  const { colors } = useTheme();
  const messageAction = message.action?.data;

  const renderMemberNames = () => {
    const updateMembers = messageAction?.updateMembers ?? [];
    const memberNames = updateMembers
      .slice(0, 2)
      .map((member) => member.dName)
      .join(', ');
    const remainingCount = updateMembers.length - 2;
    return (
      <Text strong>
        {`${memberNames} ${remainingCount > 0 ? `và ${remainingCount} người khác` : ''}`}
      </Text>
    );
  };

  const actionMessages: Record<IDataActionType, React.ReactNode> = {
    member_join_group: (
      <>
        <Text strong>{messageAction?.implementer.name}</Text> đã thêm{' '}
        <Text strong>{renderMemberNames()}</Text>vào nhóm
      </>
    ),
    member_leave_group: (
      <>
        <Text strong>{renderMemberNames()}</Text> đã rời khỏi nhóm
      </>
    ),
    remove_member_group: (
      <>
        <Text strong>{messageAction?.implementer.name}</Text> đã xóa{' '}
        <Text strong>{renderMemberNames()}</Text> khỏi nhóm
      </>
    ),
  };

  const actionType = messageAction?.type;
  const hasValidAction = actionType && actionType in actionMessages;

  return (
    <View
      style={{
        backgroundColor: colors.gray100,
        borderRadius: 12,
        padding: 4,
        paddingHorizontal: 8,
      }}
    >
      {hasValidAction ? <Text>{actionMessages[actionType]}</Text> : null}
    </View>
  );
}
export default memo(MessageActions);
