import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  SatosheepToken as SatosheepTokenContract,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent,
} from "../generated/SatosheepToken/SatosheepToken";
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused,
  Sheep,
  User,
} from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const newOwnerID = event.params.to;
  let newUser = User.load(newOwnerID);
  if (!newUser) {
    newUser = new User(newOwnerID);
    newUser.address = newOwnerID;
    newUser.totalOwned.plus(BigInt.fromI32(1));
    newUser.save();
  }

  let oldUser = User.load(event.params.from);
  if (oldUser) {
    oldUser.totalOwned.minus(BigInt.fromI32(1));
    oldUser.save();
  }

  const sheepID = event.params.tokenId.toString();
  let sheep = Sheep.load(sheepID);
  if (!sheep) {
    const sheepContract = SatosheepTokenContract.bind(event.address);
    sheep = new Sheep(sheepID);
    sheep.tokenURI = sheepContract.tokenURI(event.params.tokenId);
    sheep.tokenID = event.params.tokenId;
    sheep.createdAtTimestamp = event.block.timestamp;
    sheep.lastTransferedTimestamp = event.block.timestamp;
    sheep.creator = newOwnerID;
    sheep.owner = newOwnerID;
  } else {
    sheep.lastTransferedTimestamp = event.block.timestamp;
    sheep.owner = newOwnerID;
  }
  sheep.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
